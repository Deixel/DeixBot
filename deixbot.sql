-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jul 02, 2016 at 11:28 PM
-- Server version: 5.6.28-0ubuntu0.15.10.1
-- PHP Version: 7.0.4-7ubuntu2.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `deixbot`
--
CREATE DATABASE IF NOT EXISTS `deixbot` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `deixbot`;

-- --------------------------------------------------------

--
-- Table structure for table `configs`
--

CREATE TABLE IF NOT EXISTS `configs` (
  `configID` int(8) NOT NULL AUTO_INCREMENT,
  `configName` varchar(32) NOT NULL,
  `configValue` varchar(64) NOT NULL,
  PRIMARY KEY (`configID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `configs`
--

INSERT INTO `configs` (`configID`, `configName`, `configValue`) VALUES
(1, 'cmdprefix', '!'),
(2, 'vol', '0.25');

-- --------------------------------------------------------

--
-- Table structure for table `playing`
--

CREATE TABLE IF NOT EXISTS `playing` (
  `playingID` int(11) NOT NULL AUTO_INCREMENT,
  `playingString` varchar(64) NOT NULL,
  PRIMARY KEY (`playingID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `playing`
--

INSERT INTO `playing` (`playingID`, `playingString`) VALUES
(1, 'with your emotions'),
(2, 'with fire'),
(3, 'with myself');

-- --------------------------------------------------------

--
-- Table structure for table `soundboard`
--

CREATE TABLE IF NOT EXISTS `soundboard` (
  `soundID` int(11) NOT NULL AUTO_INCREMENT,
  `alias` varchar(16) NOT NULL,
  `description` varchar(64) NOT NULL,
  `path` varchar(64) NOT NULL,
  PRIMARY KEY (`soundID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `soundboard`
--

INSERT INTO `soundboard` (`soundID`, `alias`, `description`, `path`) VALUES
(1, 'bh', 'Hilarity Ensues', './sounds/bennyHill.mp3');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
