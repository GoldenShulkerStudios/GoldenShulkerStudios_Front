import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_V1_URL } from '../config';

// Banner slide data structure ready for Admin Panel integration
export interface BannerSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    image: string;
}

const Banner = () => {
    const navigate = useNavigate();
    const [slides, setSlides] = useState<BannerSlide[]>([]);
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        fetch(`${API_V1_URL}/banner/`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const sorted = data.sort((a: any, b: any) => a.order - b.order);
                    const formattedSlides = sorted.map((b: any) => ({
                        id: b.id,
                        title: b.title,
                        subtitle: b.subtitle,
                        description: b.description,
                        buttonText: b.button_text,
                        buttonLink: b.button_link,
                        image: b.image_url?.startsWith('http') ? b.image_url : `${API_BASE_URL}${b.image_url}`
                    }));
                    setSlides(formattedSlides);
                }
            })
            .catch(err => console.error("Error fetching banners:", err));
    }, []);

    const handleAction = (link: string) => {
        if (!link) return;
        if (link.startsWith('http')) {
            window.open(link, '_blank');
        } else {
            navigate(link);
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
    };

    if (slides.length === 0) return null;

    return (
        <div className="banner-wrapper">
            <div className="banner-container">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(_e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);

                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1);
                            }
                        }}
                        className="slide"
                    >
                        <div className="slide-content">
                            <div className="text-area">
                                <h1 className="slide-title">{slides[current].title}</h1>
                                <h3 className="slide-subtitle">{slides[current].subtitle}</h3>
                                <p className="slide-description">{slides[current].description}</p>
                                <button
                                    className="slide-btn"
                                    onClick={() => handleAction(slides[current].buttonLink)}
                                >
                                    {slides[current].buttonText}
                                </button>
                            </div>
                            <div className="image-area">
                                <img src={slides[current].image} alt="GSS Showcase" />
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <button className="arrow prev" onClick={() => paginate(-1)}>
                    <ChevronLeft size={60} />
                </button>
                <button className="arrow next" onClick={() => paginate(1)}>
                    <ChevronRight size={60} />
                </button>

                <div className="pagination">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`dot ${index === current ? 'active' : ''}`}
                            onClick={() => {
                                setDirection(index > current ? 1 : -1);
                                setCurrent(index);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Banner;
