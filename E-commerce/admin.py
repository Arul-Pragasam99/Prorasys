from main import app, db
from models import *
from flask_sqlalchemy import SQLAlchemy
from flask import flash,render_template,request,session, redirect, url_for
import uuid
import logging
from werkzeug.utils import secure_filename
import os
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
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/admin', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'GET':
         return render_template('admin_login.html')

    admin_id = request.form.get('admin_id')
    entered_password = request.form.get('password')

    if admin_id and entered_password:
        admin = Admin.query.filter_by(admin_id=admin_id).first()
        if admin and admin.login_id == entered_password:
            session['admin_id'] = admin.admin_id
            return render_template('addproduct.html')
        else:
            error = 'Invalid Credentials. Please try again.'
    else:
        error = 'Missing username or password. Please try again.'
    return render_template('admin_login.html', error=error)

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

@app.route('/productranking', methods=['GET', 'POST'])
def productranking():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))
    
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

    return render_template('productranking.html',products=products)

@app.route('/add_userdetails', methods=['GET', 'POST'])
def add_userdetails():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))
    
    if request.method == 'POST':
        
        age = request.form['age']
        uname = request.form['uname']
        
        review = request.form['review']
        verified = request.form['verified']
        engagement = request.form['engagement']
        frequency = request.form['frequency']
        similarity = request.form['similarity']

        new_user = USERDATA(user_id = str(uuid.uuid4())[:20], age=age, review=review, verified=verified, engagement = engagement, frequency = frequency, similarity = similarity,username=uname)
        db.session.add(new_user)
        db.session.commit()

    return render_template('admin_dashboard.html')




@app.route('/add_reviewdata', methods=['GET', 'POST'])
def add_reviewdata():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))
    
    if request.method == 'POST':
        
        review = request.form['review']
        rating = request.form['rating']
        frating = request.form['frating']
        userid = request.form['userid']
        productid = request.form['productid']
       

        new_user = ReviewDATA(review_id = str(uuid.uuid4())[:20], userid=userid, productid=productid, review=review, rating = rating)
        db.session.add(new_user)
        db.session.commit()

    return render_template('admin_dashboard.html')


@app.route('/add_product', methods=['GET', 'POST'])
def add_product():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))
    
    if request.method == 'POST':
        name = request.form['name']
        description = request.form['description']
        price = request.form['price']
        category = request.form['category']
        unit_weight = request.form['weight']
        quantity = request.form['quantity']

        # Check if product already exists
        existing_product = Product.query.filter_by(product_name=name, product_description=description, price=price, category=category, unit_weight=unit_weight).first()
        print(existing_product)
        if existing_product:
            # Return an error message if the product already exists
            return render_template('admin_dashboard.html', message="Product already exists")

        # save uploaded image file
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file and allowed_file(image_file.filename):
                filename = secure_filename(image_file.filename)
                image_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        

        new_product = Product(product_id = str(uuid.uuid4())[:20], product_name=name, product_description=description, price=price, quantity_pu = quantity, product_image = filename, category = category, unit_weight=unit_weight)
        db.session.add(new_product)
        db.session.commit()

    return render_template('admin_dashboard.html')

@app.route('/edit_product', methods=['GET', 'POST'])
def edit_product():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))

    product_id = request.form['product_id']
    product = Product.query.filter_by(product_id=product_id).first() 
    
    if request.method == 'POST':
        product.product_name = request.form['new_name']
        product.product_description = request.form['new_description']
        product.price = request.form['new_price']

        db.session.commit()

    return render_template('admin_dashboard.html')

@app.route('/remove_product', methods=['POST'])
def remove_product():
    product_id = request.form['product_id']
    
    # check if product exists
    product = Product.query.filter_by(product_id=product_id).first()
    if not product:
        flash('Product not found.')
        return redirect(url_for('admin'))
    
    # remove product from database
    db.session.delete(product)
    db.session.commit()
    
    flash('Product removed successfully.')
    return render_template('admin_dashboard.html')

@app.route('/orders')
def admin_orders():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))

    orders = OrderInfo.query.all()
    return render_template('orders.html', orders=orders)

@app.route('/adduser')
def adduser():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))

    orders = OrderInfo.query.all()
    return render_template('adduser.html', orders=orders)

@app.route('/admindash')
def admindash():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))

    orders = OrderInfo.query.all()
    return render_template('addproduct.html', orders=orders)


@app.route('/addreview')
def addreview():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))

    products = Product.query.all()
    users = USERDATA.query.all()
    return render_template('addreview.html', products=products,users=users)



@app.route('/analytics/')
def analytics():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))    
    
    return dash_app.index()

# create Dash app
dash_app = dash.Dash(__name__, server=app, url_base_pathname='/analytics/')


#helper function to get product sales and revenue data
def get_product_sales():
    with app.app_context():
        product_sales = []
        for product in Product.query.all():
            order_dates = []
            quantity_sold = []
            revenue = []
            for order_date, sum_quantity, sum_price in db.session.query(Order.order_date, db.func.sum(OrderItem.quantity), db.func.sum(OrderItem.unit_price)).join(OrderItem).filter_by(product_id=product.product_id).group_by(Order.order_date):
                order_dates.append(order_date)
                quantity_sold.append(sum_quantity)
                revenue.append(sum_price)
            product_sales.append({'product_name': product.product_name, 'order_dates': order_dates, 'quantity_sold': quantity_sold, 'revenue': revenue})
        return product_sales

    # helper function to get total revenue by date
def get_revenue_by_date():
    with app.app_context():
        revenue_by_date = []
        for order_date, total_revenue in db.session.query(Order.order_date, db.func.sum(OrderItem.unit_price * OrderItem.quantity)).join(OrderItem).group_by(Order.order_date):
            revenue_by_date.append({'order_date': order_date, 'total_revenue': total_revenue})
        return revenue_by_date

# define Dash layout
dash_app.layout = html.Div(children=[
    html.H1(children='Product Sales'),
    html.H2(children='Quantity of each Product sold'),
    dcc.Graph(
        id='product-sales-quantity-graph',
        figure={
            'data': [
                go.Scatter(
                    x=product_sales['order_dates'],
                    y=product_sales['quantity_sold'],
                    name=product_sales['product_name']
                )
                for product_sales in get_product_sales()
            ],
            'layout': go.Layout(
                xaxis={'title': 'Date'},
                yaxis={'title': 'Quantity Sold'},
                title='Quantity of each Product sold'
            )
        }
    ),
    html.H2(children='Revenue generated by each Product'),
    dcc.Graph(
        id='product-sales-revenue-graph',
        figure={
            'data': [
                go.Scatter(
                    x=product_sales['order_dates'],
                    y=product_sales['revenue'],
                    name=product_sales['product_name']
                )
                for product_sales in get_product_sales()
            ],
            'layout': go.Layout(
                xaxis={'title': 'Date'},
                yaxis={'title': 'Revenue'},
                title='Revenue generated by each Product'
            )
        }
    ),
    html.H2(children='Total Revenue by Date'),
    dcc.Graph(
        id='total-revenue-by-date',
        figure={
            'data': [go.Scatter(
            x=[rbd['order_date'] for rbd in get_revenue_by_date()],
            y=[rbd['total_revenue'] for rbd in get_revenue_by_date()]
            )],
            'layout': go.Layout(title='Total Revenue by Date', xaxis=dict(title='Date'), yaxis=dict(title='Revenue'))
        }
    )
])
