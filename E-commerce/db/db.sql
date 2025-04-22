/*
SQLyog Community v13.3.0 (64 bit)
MySQL - 10.4.32-MariaDB : Database - ecommerce
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`ecommerce` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `ecommerce`;

/*Table structure for table `admin` */

DROP TABLE IF EXISTS `admin`;

CREATE TABLE `admin` (
  `admin_id` varchar(20) NOT NULL,
  `first_name` varchar(20) DEFAULT NULL,
  `last_name` varchar(20) DEFAULT NULL,
  `login_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `login_id` (`login_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `admin` */

insert  into `admin`(`admin_id`,`first_name`,`last_name`,`login_id`) values 
('A001','Admin','Admin','A001');

/*Table structure for table `cart` */

DROP TABLE IF EXISTS `cart`;

CREATE TABLE `cart` (
  `cart_id` varchar(20) NOT NULL,
  `nop` int(11) DEFAULT NULL,
  `total_price` int(11) DEFAULT NULL,
  `customer` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`cart_id`),
  KEY `customer` (`customer`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`customer`) REFERENCES `customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `cart` */

insert  into `cart`(`cart_id`,`nop`,`total_price`,`customer`) values 
('5b26638c-0669-423b-b',2,800,'d76c83be'),
('d69c1e60-ef5d-4af4-b',0,0,'2b42d5d5');

/*Table structure for table `cart_products` */

DROP TABLE IF EXISTS `cart_products`;

CREATE TABLE `cart_products` (
  `cart_id` varchar(20) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  PRIMARY KEY (`cart_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_products_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`),
  CONSTRAINT `cart_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `cart_products` */

insert  into `cart_products`(`cart_id`,`product_id`,`quantity`) values 
('5b26638c-0669-423b-b','10000',2);

/*Table structure for table `category` */

DROP TABLE IF EXISTS `category`;

CREATE TABLE `category` (
  `category_id` varchar(20) NOT NULL,
  `category_name` varchar(20) DEFAULT NULL,
  `description` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `category` */

insert  into `category`(`category_id`,`category_name`,`description`) values 
('C001','Mobile & Accessories','Products related to electronic devices and gadgets'),
('C002','Laptops & Computers','Products related to Laptops & Computers'),
('C003','Home Appliances','Home Appliances products');

/*Table structure for table `customer` */

DROP TABLE IF EXISTS `customer`;

CREATE TABLE `customer` (
  `customer_id` varchar(20) NOT NULL,
  `first_name` varchar(20) DEFAULT NULL,
  `last_name` varchar(20) DEFAULT NULL,
  `loginid` varchar(10) DEFAULT NULL,
  `passwd` varchar(20) DEFAULT NULL,
  `contact_num` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `loginid` (`loginid`),
  UNIQUE KEY `passwd` (`passwd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `customer` */

insert  into `customer`(`customer_id`,`first_name`,`last_name`,`loginid`,`passwd`,`contact_num`) values 
('2b42d5d5','raji','raji','raji','raji','08667622696'),
('3aaeb91a','RAJESWARI','SAMUTHIRAKANI','SAMUTHIRAK','SAMUTHIRAKANI','08667622696'),
('d76c83be','Mano','m','Mano','Mano','08667622696');

/*Table structure for table `order_items` */

DROP TABLE IF EXISTS `order_items`;

CREATE TABLE `order_items` (
  `order_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` varchar(20) NOT NULL,
  `unit_price` float NOT NULL,
  `quantity` int(11) NOT NULL,
  `discount` float NOT NULL,
  PRIMARY KEY (`order_id`,`product_id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `order_items` */

insert  into `order_items`(`order_id`,`product_id`,`unit_price`,`quantity`,`discount`) values 
(2,'10022',600,3,0);

/*Table structure for table `orders` */

DROP TABLE IF EXISTS `orders`;

CREATE TABLE `orders` (
  `order_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_date` date NOT NULL,
  `shipped_date` date DEFAULT NULL,
  `shipper_id` int(11) DEFAULT NULL,
  `customer_id` varchar(20) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `orders` */

insert  into `orders`(`order_id`,`order_date`,`shipped_date`,`shipper_id`,`customer_id`,`address`) values 
(1,'2024-11-25',NULL,123,'2b42d5d5','South Sreeert'),
(2,'2024-11-25',NULL,123,'2b42d5d5','cgfgg');

/*Table structure for table `product` */

DROP TABLE IF EXISTS `product`;

CREATE TABLE `product` (
  `product_id` varchar(20) NOT NULL,
  `quantity_pu` int(11) DEFAULT NULL,
  `product_name` varchar(20) DEFAULT NULL,
  `product_image` varchar(100) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `product_description` varchar(30) DEFAULT NULL,
  `unit_weight` int(11) DEFAULT NULL,
  `supplier` varchar(20) DEFAULT NULL,
  `category` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `supplier` (`supplier`),
  KEY `category` (`category`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`supplier`) REFERENCES `supplier` (`supplier_id`),
  CONSTRAINT `product_ibfk_2` FOREIGN KEY (`category`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `product` */

insert  into `product`(`product_id`,`quantity_pu`,`product_name`,`product_image`,`price`,`product_description`,`unit_weight`,`supplier`,`category`) values 
('10000',8,'Mouse 2.0','mouse.JPG',400,'A good camera fella',20,'ABC123','C001'),
('10001',12,'Camera 1466FGFG','camera.JPG',15000,'the OG camera',400,'ABC123','C001'),
('10002',10,'Small adapters 2.0','smalladapters.JPG',800,'adapters for everything ',50,'ABC123','C001'),
('10010',10,'Blue shirt','blueshirt.JPG',800,'A good shirt mister',5,'ABC123','C002'),
('10012',10,'Black Pants','blackpant.JPG',4000,'the OG pant is back',10,'ABC123','C002'),
('10020',10,'Car','car.JPEG',40,'Toy car',5,'ABC123','C003'),
('10022',7,'Teddy bear','bear.JPEG',200,'the OG BEAR',10,'ABC123','C003'),
('2d93a3c5-1816-4b10-8',67,'Headphone','3.jpg',23,'fsdg fdgtfdyht',2,NULL,'C001'),
('845a6112-485c-41ba-9',3,'T-Shirts','1.jpg',100,'Otto Brand',200,NULL,'C002');

/*Table structure for table `reviewdata` */

DROP TABLE IF EXISTS `reviewdata`;

CREATE TABLE `reviewdata` (
  `review_id` varchar(20) NOT NULL,
  `userid` varchar(30) DEFAULT NULL,
  `productid` varchar(30) DEFAULT NULL,
  `review` varchar(30) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `frating` int(10) DEFAULT NULL,
  PRIMARY KEY (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `reviewdata` */

insert  into `reviewdata`(`review_id`,`userid`,`productid`,`review`,`rating`,`frating`) values 
('08403d44-813a-4202-8','7c0d54b9-887c-42be-b','10012','Very good and nice product',5,4),
('14b3a45b-63ea-4931-b','7c0d54b9-887c-42be-b','10000','nice produt',3,4),
('14b3a45b-63ea-4931-c','7c0d54b9-887c-42be-b','10001','nice produt',3,4),
('151284fb-cd8e-4e63-8','eab3a7b6-5bac-44e1-b','10000','Very good and nice product',3,4),
('54c057ce-0202-4eab-8','7c0d54b9-887c-42be-b','10022','Very good and nice product',2,4),
('57b853c6-0a69-416b-b','7c0d54b9-887c-42be-b','10002','Very good and nice product',4,4),
('663eb661-2cef-42b6-b','7c0d54b9-887c-42be-b','10010','Very good and nice product',5,4),
('7369aa27-7417-47a4-8','7c0d54b9-887c-42be-b','10002','Very good and nice product',4,4),
('a1d30e21-025e-47aa-a','7c0d54b9-887c-42be-b','2d93a3c5-1816-4b10-8','Very good and nice product',5,4),
('a44f1ad1-a31d-45b2-a','7c0d54b9-887c-42be-b','2d93a3c5-1816-4b10-8','Very good and nice product',4,4),
('a4ace6d2-70d5-4084-a','eab3a7b6-5bac-44e1-b','10012','very worst product',1,4),
('d1c3af59-7e59-45cb-9','7c0d54b9-887c-42be-b','845a6112-485c-41ba-9','Very good and nice product',5,4),
('e07b2e59-a08b-430a-9','7c0d54b9-887c-42be-b','10020','Very good and nice product',4,4),
('e152f43a-fd75-43f3-b','7c0d54b9-887c-42be-b','10012','Very good and nice product',5,4);

/*Table structure for table `shipper` */

DROP TABLE IF EXISTS `shipper`;

CREATE TABLE `shipper` (
  `shipper_id` varchar(40) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company_name` varchar(20) DEFAULT NULL,
  `order_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`shipper_id`),
  UNIQUE KEY `order_id` (`order_id`),
  CONSTRAINT `shipper_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `shipper` */

/*Table structure for table `supplier` */

DROP TABLE IF EXISTS `supplier`;

CREATE TABLE `supplier` (
  `supplier_id` varchar(20) NOT NULL,
  `first_name` varchar(20) DEFAULT NULL,
  `last_name` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `supplier` */

insert  into `supplier`(`supplier_id`,`first_name`,`last_name`) values 
('ABC123','Reji','Reji');

/*Table structure for table `userdata` */

DROP TABLE IF EXISTS `userdata`;

CREATE TABLE `userdata` (
  `user_id` varchar(20) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `review` int(11) DEFAULT NULL,
  `verified` int(11) DEFAULT NULL,
  `engagement` int(11) DEFAULT NULL,
  `frequency` int(11) DEFAULT NULL,
  `similarity` int(11) DEFAULT NULL,
  `username` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `userdata` */

insert  into `userdata`(`user_id`,`age`,`review`,`verified`,`engagement`,`frequency`,`similarity`,`username`) values 
('7c0d54b9-887c-42be-b',20,10,20,20,12,23,'mano'),
('b1d1b7ca-56ab-40ff-a',20,12,2,2,4,5,'Peter'),
('eab3a7b6-5bac-44e1-b',20,12,34,12,33,44,'Adhi');

/*Table structure for table `wish_products` */

DROP TABLE IF EXISTS `wish_products`;

CREATE TABLE `wish_products` (
  `list_id` varchar(20) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  PRIMARY KEY (`list_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wish_products_ibfk_1` FOREIGN KEY (`list_id`) REFERENCES `wishlist` (`list_id`),
  CONSTRAINT `wish_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `wish_products` */

insert  into `wish_products`(`list_id`,`product_id`,`quantity`) values 
('423ecfb7-8c23-4ac1-9','10001',NULL);

/*Table structure for table `wishlist` */

DROP TABLE IF EXISTS `wishlist`;

CREATE TABLE `wishlist` (
  `list_id` varchar(20) NOT NULL,
  `nop` int(11) DEFAULT NULL,
  `customer` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`list_id`),
  KEY `customer` (`customer`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`customer`) REFERENCES `customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `wishlist` */

insert  into `wishlist`(`list_id`,`nop`,`customer`) values 
('423ecfb7-8c23-4ac1-9',1,'2b42d5d5');

/* Trigger structure for table `cart_products` */

DELIMITER $$

/*!50003 DROP TRIGGER*//*!50032 IF EXISTS */ /*!50003 `update_product_quantity_trigger` */$$

/*!50003 CREATE */ /*!50017 DEFINER = 'root'@'localhost' */ /*!50003 TRIGGER `update_product_quantity_trigger` AFTER INSERT ON `cart_products` FOR EACH ROW 
BEGIN
    -- Update the product table to reduce the quantity
    UPDATE product
    SET quantity_pu = quantity_pu - NEW.quantity
    WHERE product_id = NEW.product_id;
END */$$


DELIMITER ;

/* Procedure structure for procedure `count_it` */

/*!50003 DROP PROCEDURE IF EXISTS  `count_it` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`localhost` PROCEDURE `count_it`(OUT pcount INT)
BEGIN
    SELECT COUNT(*) INTO pcount FROM product;
END */$$
DELIMITER ;

/*Table structure for table `myview` */

DROP TABLE IF EXISTS `myview`;

/*!50001 DROP VIEW IF EXISTS `myview` */;
/*!50001 DROP TABLE IF EXISTS `myview` */;

/*!50001 CREATE TABLE  `myview`(
 `product_name` varchar(20) ,
 `quantity_pu` int(11) ,
 `supplier_id` varchar(20) ,
 `first_name` varchar(20) ,
 `last_name` varchar(20) 
)*/;

/*Table structure for table `order_info` */

DROP TABLE IF EXISTS `order_info`;

/*!50001 DROP VIEW IF EXISTS `order_info` */;
/*!50001 DROP TABLE IF EXISTS `order_info` */;

/*!50001 CREATE TABLE  `order_info`(
 `order_id` bigint(20) unsigned ,
 `order_date` date ,
 `shipped_date` date ,
 `shipper_id` int(11) ,
 `customer_id` varchar(20) ,
 `customer_name` int(1) ,
 `address` varchar(100) ,
 `product_id` varchar(20) ,
 `product_name` varchar(20) ,
 `unit_price` float ,
 `quantity` int(11) 
)*/;

/*Table structure for table `product_view` */

DROP TABLE IF EXISTS `product_view`;

/*!50001 DROP VIEW IF EXISTS `product_view` */;
/*!50001 DROP TABLE IF EXISTS `product_view` */;

/*!50001 CREATE TABLE  `product_view`(
 `product_id` varchar(20) ,
 `quantity_pu` int(11) ,
 `product_name` varchar(20) ,
 `product_image` varchar(100) ,
 `price` int(11) ,
 `product_description` varchar(30) ,
 `unit_weight` int(11) ,
 `supplier` varchar(20) ,
 `category` varchar(20) ,
 `customer` varchar(20) ,
 `quantity` int(11) 
)*/;

/*View structure for view myview */

/*!50001 DROP TABLE IF EXISTS `myview` */;
/*!50001 DROP VIEW IF EXISTS `myview` */;

/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `myview` AS select `p`.`product_name` AS `product_name`,`p`.`quantity_pu` AS `quantity_pu`,`s`.`supplier_id` AS `supplier_id`,`s`.`first_name` AS `first_name`,`s`.`last_name` AS `last_name` from (`product` `p` join `supplier` `s` on(`p`.`supplier` = `s`.`supplier_id`)) */;

/*View structure for view order_info */

/*!50001 DROP TABLE IF EXISTS `order_info` */;
/*!50001 DROP VIEW IF EXISTS `order_info` */;

/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `order_info` AS select `o`.`order_id` AS `order_id`,`o`.`order_date` AS `order_date`,`o`.`shipped_date` AS `shipped_date`,`o`.`shipper_id` AS `shipper_id`,`o`.`customer_id` AS `customer_id`,`c`.`first_name` <> 0 or ' ' or `c`.`last_name` <> 0 AS `customer_name`,`o`.`address` AS `address`,`oi`.`product_id` AS `product_id`,`p`.`product_name` AS `product_name`,`oi`.`unit_price` AS `unit_price`,`oi`.`quantity` AS `quantity` from (((`orders` `o` join `order_items` `oi` on(`o`.`order_id` = `oi`.`order_id`)) join `customer` `c` on(`o`.`customer_id` = `c`.`customer_id`)) join `product` `p` on(`oi`.`product_id` = `p`.`product_id`)) */;

/*View structure for view product_view */

/*!50001 DROP TABLE IF EXISTS `product_view` */;
/*!50001 DROP VIEW IF EXISTS `product_view` */;

/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `product_view` AS select `p`.`product_id` AS `product_id`,`p`.`quantity_pu` AS `quantity_pu`,`p`.`product_name` AS `product_name`,`p`.`product_image` AS `product_image`,`p`.`price` AS `price`,`p`.`product_description` AS `product_description`,`p`.`unit_weight` AS `unit_weight`,`p`.`supplier` AS `supplier`,`p`.`category` AS `category`,`c`.`customer` AS `customer`,`cp`.`quantity` AS `quantity` from ((`product` `p` join `cart_products` `cp` on(`p`.`product_id` = `cp`.`product_id`)) join `cart` `c` on(`cp`.`cart_id` = `c`.`cart_id`)) */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
