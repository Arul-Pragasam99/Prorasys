from main import app, db
from models import *
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, flash,render_template,request,session, redirect, url_for
import uuid
import logging
from werkzeug.utils import secure_filename
import os
import stripe
from datetime import date
import dash
from dash import dcc
from dash import html
import plotly.graph_objs as go
import pandas as pd
import pymysql
pymysql.install_as_MySQLdb()
import MySQLdb
import pandas as pd
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
# Download VADER lexicon (only once)
nltk.download('vader_lexicon')
# Initialize Sentiment Analyzer
sia = SentimentIntensityAnalyzer()
def get_sentiment_score(text):
    return sia.polarity_scores(text)["compound"]
def connection():
    conn = MySQLdb.connect(host="localhost",
                           user = "root",
                           passwd = "",
                           port=3306,
                           db = "ecommerce")
    c = conn.cursor()

    return c, conn	
c, conn=connection()
def compute_weighted_score(user_data, weights):
        data= sum(value * weight / 100 for value, weight in zip(user_data, weights))
        if(data>10):
            return 10
        else:
            return data
def calculate_final_score(credibility, sentiment, rating, fake_review,featurerating):
    # Calculate the Combined Product Score
    combined_score = (0.5 * credibility) + (0.3 * sentiment) + (0.1 * rating)+(0.1 * featurerating)
    # Calculate the Final Product Score
    final_score = combined_score * (1 - fake_review/10)
    return final_score

def productranking(productid):
    c, conn=connection()
    query = "SELECT user_id,age,review,verified,engagement FROM userdata"
    df = pd.read_sql(query, conn)
    data=df.values
    userdata_dict = {row[0]: list(row[1:]) for row in data}
    query = "SELECT user_id,frequency,similarity FROM userdata"
    df = pd.read_sql(query, conn)
    data=df.values
    usual_dict = {row[0]: list(row[1:]) for row in data}

    # Close connection
    conn.close()
    factors = ["Account Age", "Review History", "Verified Purchase", "Review Engagement"]
    weights = [20, 15, 15, 10]  # In percentage
    users = userdata_dict

    # Compute weighted scores for each user
   

    user_scores = {user: compute_weighted_score(data, weights) for user, data in users.items()}

    # Unusual Pattern Score Factors
    unusual_factors = ["Review Frequency", "Similarity in Content"]
    unusual_weights = [20, 20]
    unusual_users =usual_dict

    # Compute unusual pattern scores
    unusual_scores = {user: compute_weighted_score(data, unusual_weights) for user, data in unusual_users.items()}

    # Compute Final Fake Review Score
    final_scores = {
        user: (0.6 * user_scores[user]) + (0.4 * unusual_scores[user])
        for user in users
    }

    # Combine data
    factors += unusual_factors + ["Total (Weighted 100%)", "Final Fake Review Score"]
    weights += unusual_weights + [100, "-"]

    for user in users:
        users[user] += unusual_users[user] + [unusual_scores[user], final_scores[user]]

    data = {
        "Factor": factors,
        "Weight (%)": weights,
        **users
    }

    # Create DataFrame
    df = pd.DataFrame(data)
    c, conn=connection()
    query = "SELECT * FROM reviewdata"
    product = pd.read_sql(query, conn)
    product["credibility_score"] = product["userid"].map(user_scores)
    product["fake_review_score"] = product["userid"].map(final_scores)
    query = "SELECT user_id,username FROM userdata"
    df = pd.read_sql(query, conn)
    dfuser_dict = df.set_index('user_id')['username'].to_dict()
    product["UserName"] = product["userid"].map(dfuser_dict)
    # Apply sentiment score to DataFrame
    product["sentiment_score"] = product["review"].apply(get_sentiment_score)
    grouped_df = product.groupby("productid").agg({
        "rating": "mean",
        "frating": "mean",
        "credibility_score": "mean",
        "fake_review_score": "mean",
        "sentiment_score": "mean"
    }).reset_index()
    product_df = grouped_df.to_dict(orient='records')
    products =product_df

    # Calculate final scores for all products and store them in the list
    for product in products:
        final_score = calculate_final_score(
            product['credibility_score'],
            product['sentiment_score'],
            product['rating'],
            product['frating'],
            product['fake_review_score']
        )
        product['final_score'] = final_score

    query = "SELECT product_id,category FROM product"
    df = pd.read_sql(query, conn)
    df_dict = df.set_index('product_id')['category'].to_dict()

    # Create a DataFrame from the product data
    df = pd.DataFrame(products)
    df["product_cata"] = df["productid"].map(df_dict)
    # Sort the DataFrame by the final score in descending order
    df['rank'] = df.groupby('product_cata')['final_score'].rank(ascending=False, method='dense')

    # Sort for better readability
    df = df.sort_values(by=['product_cata', 'rank'])
  
    products = df.to_dict(orient='records')

    if(productid=="all"):
        dfproduct_rate_dict = df.set_index('productid')['rank'].to_dict()
       
        c, conn=connection()
        query = "SELECT * FROM product"
        df_product = pd.read_sql(query, conn)
        df_product["rank"] = df_product["product_id"].map(dfproduct_rate_dict)
        catagorymap={'C001': 'Mobile and Accessories', 'C002': 'Laptops and Computers', 'C003': 'Home Appliances'}
        df_product["category"] = df_product["category"].map(catagorymap)
        df_product = df_product.sort_values(by=['category', 'rank'])
        
        return df_product
         

  
    product_row = df[df['productid'] == productid].iloc[0]  # Retrieves the first match
    product_dict = product_row.to_dict()
    return product_dict

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']



@app.route("/<string:name>")
def invalid(name):
    return render_template('404.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
         return render_template('login.html', error=None)
    

    usr = request.form.get('username')
    entered_password = request.form.get('password')

    if usr and entered_password:
        customer = Customer.query.filter_by(loginid=usr).first()
        if customer and customer.passwd == entered_password:
            session['username'] = usr
            session['customer_id'] = customer.customer_id
            flash('You are successfully logged in')
            return redirect(url_for('index'))
        else:
            error = 'Invalid Credentials. Please try again.'
    else:
        error = 'Missing username or password. Please try again.'

    return render_template('login.html', error=error)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method=='POST':
        fn=request.form['first_name']
        ln=request.form['last_name']
        usr=request.form['loginid']
        cno=request.form['contact_num']
        pwd=request.form['passwd']

        error = None

        if not (fn and ln and usr and cno and pwd):
            error = "Failure: Credentials are not filled in properly."
            return render_template('register.html', error)

        usr_exists = Customer.query.filter_by(loginid=usr).first()
        if usr_exists:
            error = "Failure: Username already exists"  
            return render_template('register.html', error)
                
        c_id = str(uuid.uuid4())[:8]
        new_customer = Customer(customer_id=c_id, first_name=fn, last_name=ln, loginid=usr, passwd=pwd, contact_num=cno)
        db.session.add(new_customer)
        db.session.commit()
        flash('User successfully created')
        return redirect(url_for('login'))
    
    return render_template('register.html', error = None)



@app.route('/user_info/<login_id>')
def user_info(login_id):
    customer = Customer.query.filter_by(loginid=login_id).first()
    if customer is None:
        flash("Customer not found.")
        return redirect(url_for('index'))  

    return render_template('user_info.html', customer=customer)



@app.route("/category")
def displayCategory():
    category_id = request.args.get('categoryId')
    category = Category.query.filter_by(category_id=category_id).first()
    products = db.session.query(Product).join(Category, Product.category == Category.category_id).filter(Category.category_id == category_id).all()
    return render_template('category.html', products=products, category = category)

@app.route("/productDescription")
def productDescription():
    product_id = request.args.get('productId')
    productData = Product.query.filter_by(product_id=product_id).first()
    category = Category.query.filter_by(category_id=productData.category).first()
    c, conn=connection()
    query = "SELECT user_id,username FROM userdata"
    df = pd.read_sql(query, conn)
    dfuser_dict = df.set_index('user_id')['username'].to_dict()

    reviewData = ReviewDATA.query.filter_by(productid=product_id).all()
    for review in reviewData:
        review.userid = dfuser_dict.get(review.userid, "Unknown User")
    productrankinginfo=productranking(product_id)
    print(productrankinginfo)
    for i in reviewData:
        print(i.review)

    return render_template("product.html", productdata=productData, category = category,reviewData=reviewData,productrankinginfo=productrankinginfo)



@app.route("/rank/", methods=['GET', 'POST'])
def rank():
    
    df=productranking("all")
  
    print(df)
    categories=['Mobile and Accessories','Laptops and Computers','Home Appliances']      
    
    category = request.args.get("category", "all")
    print(category)

    
    if category != "all" :
        filtered_data = df[df["category"] == category].to_dict(orient="records")
    else:
        filtered_data = df.to_dict(orient="records")


    return render_template("productrankinguser.html", productrankinginfo=filtered_data,categories=categories)



@app.route("/addToCart", methods=["POST"])
def addToCart():
    if 'username' not in session:
        return redirect(url_for('login'))

    else:
        product_id = request.args.get('productId')
        cust_id = session['customer_id']
    
        productData = Product.query.filter_by(product_id=product_id).first()
        
        cart = Cart.query.filter_by(customer=cust_id).first()

        if not cart:
            
            cart = Cart(cart_id=str(uuid.uuid4())[:20], customer=cust_id, nop=0, total_price=0)

        
        cart_product = CartProduct.query.filter_by(cart_id=cart.cart_id, product_id=product_id).first()

        if cart_product:
            cart_product.quantity += int(request.form['quantity'])
            cart.nop += int(request.form['quantity'])  
            
        else:
            cart_product = CartProduct(cart_id=cart.cart_id, product_id=product_id, quantity=int(request.form['quantity']))
            cart.nop += int(request.form['quantity'])
            db.session.add(cart_product)
           

        
        product = Product.query.get(product_id)
        cart.total_price += product.price * int(request.form['quantity'])

        db.session.add(cart) 
        db.session.commit()

        msg = "Added successfully"
        return redirect(url_for('cart'))


    
@app.route("/cart")
def cart():
    if 'username' not in session:
        return redirect(url_for('login'))

    cust_id = session['customer_id']
    cust = Customer.query.filter_by(customer_id=cust_id).first()

  
    products = (
        db.session.query(ProductView)
        .filter(Cart.customer == cust_id)
        .all()
        )

    cart = Cart.query.filter_by(customer=cust_id).first()
    if cart:
        total_price = cart.total_price
        nop = cart.nop
    else:
        return render_template("cart.html", totalPrice=0, noOfItems=0)
    return render_template("cart.html", products=products, totalPrice=total_price, noOfItems=nop)



@app.route("/addToWishlist", methods=["POST"])
def addToWishlist():
    if 'username' not in session:
        return redirect(url_for('login'))

    else:
        product_id = request.args.get('productId')
        cust_id = session['customer_id']
    
        productData = Product.query.filter_by(product_id=product_id).first()
       
        wishList = WishList.query.filter_by(customer=cust_id).first()

        if not wishList:
           
            wishList = WishList(list_id=str(uuid.uuid4())[:20], customer=cust_id, nop=0)

       
        wish_product = WishProduct.query.filter_by(list_id=wishList.list_id, product_id=product_id).first()

        if wish_product:
            wishList.nop += 1
        else:
            wish_product = WishProduct(list_id=wishList.list_id, product_id=product_id)
            wishList.nop += 1
            db.session.add(wish_product)


        db.session.add(wishList) 
        db.session.commit()

        msg = "Added successfully"
        return redirect(url_for('wishlist'))


    
@app.route("/wishlist")
def wishlist():
    if 'username' not in session:
        return redirect(url_for('login'))

    cust_id = session['customer_id']
    cust = Customer.query.filter_by(customer_id=cust_id).first()

    products = (
       db.session.query(Product, WishProduct.quantity)
       .join(Product)
       .join(WishList)
       .filter(WishList.customer == cust_id)
       .all()
       )

    wishlist = WishList.query.filter_by(customer=cust_id).first()
    if wishlist:
        nop = wishlist.nop
    else:
        return render_template("wishlist.html", noOfItems=0)
    return render_template("wishlist.html", products=products, noOfItems=nop)





@app.route("/removeFromCart", methods=["POST"])
def removeFromCart():
    if 'username' not in session:
        return redirect(url_for('login'))

    usr = session['username']
    cust_id = session['customer_id']
    product_id = request.form['productId']

    cust = Customer.query.filter_by(loginid=usr).first()
    cart = Cart.query.filter_by(customer=cust_id).first()

    try:
        cart_product = CartProduct.query.filter_by(cart_id=cart.cart_id, product_id=product_id).first()
        db.session.delete(cart_product)
        cart.nop -= cart_product.quantity
        product = Product.query.get(product_id)
        product.quantity_pu += cart_product.quantity
        cart.total_price -= product.price * cart_product.quantity
        db.session.commit()
        msg = "removed successfully"
    except Exception as e:
        db.session.rollback()
        msg = "error occurred"
        logging.error(f"Error removing item from cart: {msg}. Exception: {e}")

    return redirect(url_for('cart'))



@app.route("/")
def index():
    productData = db.session.query(Product).all()
    categoryData = db.session.query(Category).all()
    for i in productData:
         print(i)

    return render_template('index.html', productData=productData, categoryData=categoryData)

@app.route("/c001")
def c001():
    
    productData = db.session.query(Product).filter(Product.category == "C001").all()

    categoryData = db.session.query(Category).all()
    

    return render_template('index.html', productData=productData, categoryData=categoryData)

@app.route("/c002")
def c002():
    
    productData = db.session.query(Product).filter(Product.category == "C002").all()

    categoryData = db.session.query(Category).all()
    

    return render_template('index.html', productData=productData, categoryData=categoryData)

@app.route("/c003")
def c003():
    
    productData = db.session.query(Product).filter(Product.category == "C003").all()

    categoryData = db.session.query(Category).all()
    

    return render_template('index.html', productData=productData, categoryData=categoryData)

@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    if 'customer_id' not in session:
        flash('Please login first', 'warning')
        return redirect(url_for('login'))
    
    address = request.form.get('address')
    cust_id = session['customer_id']
    cart = Cart.query.filter_by(customer=cust_id).first()
    total_price = cart.total_price
    nop = cart.nop
  

    products = (
        db.session.query(ProductView)
        .filter(Cart.customer == cust_id)
        .all()
        )
    
    
    if request.method == 'POST':
        cart_products = CartProduct.query.filter_by(cart_id=cart.cart_id).all()
        line_items = []
        for cart_product in cart_products:
            product = Product.query.get(cart_product.product_id)
            line_items.append({
                'price_data': {
                    'currency': '₹',
                    'product_data': {
                        'name': product.product_name,
                        'images': [product.product_image],
                    },
                    'unit_amount': product.price * 100,
                },
                'quantity': cart_product.quantity,
            })

        session['line_items'] = line_items
        session['description'] = 'Order from Online Shopping'
        session['amount'] = total_price
        session['nop'] = nop
        session['cart_id'] = cart.cart_id
        session['customer_email'] = Customer.query.get(cust_id).loginid
        session['customer_address'] = address
        
        success()
    
    return render_template('success.html', description="Order from Online Shopping", amount=total_price, nop=nop)


def success():
    description = session['description']
    amount = session['amount']
    nop = session['nop']
    cart_id = session['cart_id']
    cust_id = session['customer_id']
    address = session['customer_address'] 
    
    # Update cart and commit changes
    cart = Cart.query.filter_by(cart_id=cart_id).first()
    cart.nop = 0
    cart.total_price = 0
    db.session.commit()
    
    # Create an Aboutorder entry
    order = Order(customer_id=cust_id, order_date = date.today(), shipper_id = 123, address = address)
    db.session.add(order)
    db.session.commit()
    
    products = (
        db.session.query(Product, CartProduct.quantity)
        .join(CartProduct)
        .filter(CartProduct.cart_id == cart_id)
        .all()
    )


    # Add order details to the database
    cart_products = CartProduct.query.filter_by(cart_id=cart_id).all()
    for product, quantity in products:
        orderItems = OrderItem(unit_price=quantity * product.price, discount=0, quantity=quantity, product_id=product.product_id, order_id=order.order_id)
        db.session.add(orderItems)
    db.session.commit()
    
    # Clear the shopping cart
    for cp in cart_products:
        db.session.delete(cp)
    db.session.commit()
    
    return render_template('success.html', description=description, amount=amount, nop=nop)


@app.route('/cancel')
def cancel():
    return render_template('cancel.html')


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))
