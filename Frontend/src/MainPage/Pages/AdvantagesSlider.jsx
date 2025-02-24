import React from "react";
import Slider from "react-slick";
import "../Styles/advantages.css";
import advantageImg from "../../Assets/home.jpg"; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const slideData = [
  {
    title: "Unlocking Growth Potential",
    description:
      "In the fast-paced world of business, staying ahead of the competition requires innovative strategies that drive growth and revenue.",
    image: advantageImg,
  },
  {
    title: "Customer Experience",
    description:
      "In the digital era, customer experience reigns supreme, and businesses are continually seeking innovative ways to enhance satisfaction.",
    image: advantageImg,
  },
  {
    title: "Unlocking Growth",
    description:
      "By leveraging advanced tools and automation, companies can unlock new levels of efficiency and market presence.",
    image: advantageImg,
  },
  {
    title: "Customer Support",
    description:
      "Efficient and responsive customer support ensures that businesses maintain strong relationships and resolve issues swiftly.",
    image: advantageImg,
  },
];

const AdvantagesSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 2000, // Adjust as needed
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="advantages-slider container mt-5 ">
      <h2 className="slider-title">Advantages of WhatsCRm</h2>
      <Slider {...settings}>
        {slideData.map((slide, index) => (
          <div key={index} className="slide">
            <div className="slide-card">
              <div className="slide-image">
                <img src={slide.image} alt={slide.title} />
              </div>
              <div className="slide-content">
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default AdvantagesSlider;
