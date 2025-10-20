import React from 'react'
import Banner from '../../components/Banner'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import Navbar from '../../components/Navbar'
import Productdisplay from '../../components/Productdisplay'
const Home = () => {
  return (
    <>
    <Navbar />
      <Header />
      <Productdisplay/>
      <Banner/>
      <Footer/>
    
    </>
  )
}

export default Home