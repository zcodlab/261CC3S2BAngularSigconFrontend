import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink,CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  // Definimos las diapositivas con tipos de contenido específicos
  slides = [
    { url: 'assets/imagenes/slider/bg1.jpg', type: 'hero' },
    { url: 'assets/imagenes/slider/bg2.jpg', type: 'about' },
    { url: 'assets/imagenes/slider/bg3.jpg', type: 'easy' },
    { url: 'assets/imagenes/slider/bg4.jpg', type: 'problems' }
  ];
  currentIndex = 0;
  private intervalId: any;

  testimonials = [
    {
      text: 'Excelente herramienta, nos ha ahorrado mucho tiempo y esfuerzo al momento de realizar las cobranzas a nuestros inquilinos',
      author: 'Administración Edificio Horizonte'
    },
    {
      text: 'Muy flexible y se adapta perfectamente a las necesidades de los condominios que administramos',
      author: 'DSW Soluciones'
    },
    {
      text: 'La transparencia en los reportes financieros ha mejorado la confianza de todos los copropietarios.',
      author: 'Condominio Las Praderas'
    },
    {
      text: 'El soporte técnico es excepcional, siempre están dispuestos a ayudar con cualquier duda.',
      author: 'Residencial San Felipe'
    }
  ];

  testimonialIndex = 0;
  private testimonialIntervalId: any;

  ngOnInit() {
    this.startSlider();
    this.startTestimonialSlider();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.testimonialIntervalId) clearInterval(this.testimonialIntervalId);
  }

  // Main Slider Logic
  startSlider() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  // Testimonial Slider Logic
  startTestimonialSlider() {
    this.testimonialIntervalId = setInterval(() => {
      this.nextTestimonial();
    }, 6000);
  }

  nextTestimonial() {
    this.testimonialIndex = (this.testimonialIndex + 1) % this.testimonials.length;
  }

  prevTestimonial() {
    this.testimonialIndex = (this.testimonialIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  goToTestimonial(index: number) {
    this.testimonialIndex = index;
  }

}
