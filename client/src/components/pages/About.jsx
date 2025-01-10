import React from 'react';
import './Gallery.css'; // Ensure you have the CSS styles for the gallery component
import { testimonial1, testimonial2, testimonial3, testimonial4, testimonial5, photo01 } from "../../assets"; // Import assets
import { BsInstagram, BsArrowLeftShort, BsArrowRightShort } from 'react-icons/bs';
import { Image, Box } from "@chakra-ui/react";

// Gallery Component
const galleryImages = [testimonial1, testimonial2, testimonial3, testimonial4, testimonial5];

const Gallery = () => {
  const scrollRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const scroll = (direction) => {
    const { current } = scrollRef;
    const scrollAmount = direction === 'left' ? -300 : 300;
    
    current.scrollTo({
      left: current.scrollLeft + scrollAmount,
      behavior: 'smooth'
    });
  };

  const startDragging = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const move = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className='app__gallery flex__center'>
      <div className='app__gallery-content'>
        <h2 className='subheading'>Testimonials</h2>
        <p className='p__opensans' style={{ color: '#AAA', marginTop: '2rem' }}>
          Explore what our clients have to say about their Radiant Soul Esthetics experience.
        </p>
      </div>

      <div className='app__gallery-images'>
        <div 
          className='app__gallery-images_container' 
          ref={scrollRef}
          onMouseDown={startDragging}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onMouseMove={move}
        >
          {[...galleryImages, ...galleryImages].map((image, index) => (
            <div 
              className='app__gallery-images_card flex__center' 
              key={`gallery_image-${index + 1}`}
              style={{ userSelect: 'none' }}
            >
              <img src={image} alt="gallery image" draggable="false" />
              <BsInstagram className='gallery__image-icon' />
            </div>
          ))}
        </div>
        <div className='app__gallery-images_arrows'>
          <BsArrowLeftShort className='gallery__arrow-icon' onClick={() => scroll('left')} />
          <BsArrowRightShort className='gallery__arrow-icon' onClick={() => scroll('right')} />
        </div>
      </div>
    </div>
  );
};

// Home Component
export default function Home() {
  return (
    <Box className="aboutMain">
      <Box className="about">
        <h2 id="aboutH2">About Radiant Soul Esthetics</h2>
        <p>Step into Radiant Soul Esthetics and experience a world where beauty meets expertise! Founded and operated by
          Deidre Hallert, we specialize in providing top-notch esthetician services and professional permanent makeup
          solutions. With a passion for enhancing natural beauty and a dedication to client satisfaction, Deidre
          brings experience and a keen eye for detail to every appointment. Picture a cozy sanctuary where relaxation
          meets luxury. Whether you opt for permanent makeup or a rejuvenating session, get ready for a deluxe journey
          with the finest products and care. Welcome to your beauty haven!</p>
      </Box>

      {/* Add the Gallery Component here */}
      <Gallery />

      <Box id="deidre">
        <Box className="deidre-container" mb={50}>
          <h2 id="meetH2">Meet Deidre</h2>
          <p>As the sole proprietor and lead esthetician at Radiant Soul Esthetics, Deidre is committed to delivering
            personalized care tailored to each client&apos;s unique needs. With her training and understanding of the
            latest trends and techniques in the beauty industry, Deidre strives to exceed expectations with every
            service, whether it&apos;s a relaxing facial, precise eyebrow microblading, or flawless permanent makeup
            application. Her goal is to help you achieve your outer glow so that you can radiate from within.</p>
          <Box display="flex" justifyContent="center" align="center">
            <Image id="profilephoto" objectFit="cover" boxSize="500px" src={photo01} width={400} alt="picture of Deidre" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
