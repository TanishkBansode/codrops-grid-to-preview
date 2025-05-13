import { gsap } from 'gsap'

export default class ProductPreview {
  constructor({ products, container }) {
    this.container = container
    this.masked = this.container.querySelector('.masked-preview')
    this.products = products
    this.scaleFactor = 5
    this.armWidth = {
      x: 10,
      y: 10
    }

    const allPreviewImages = this.container.querySelector('.product-preview__images').children

    // Group by product ID
    const previewImages = {}
    Array.from(allPreviewImages).forEach((img) => {
      const id = img.dataset.id
      if (!previewImages[id]) {
        previewImages[id] = []
      }
      previewImages[id].push(img)
    })

    this.ui = {
      title: this.container.querySelector('.product-title'),
      price: this.container.querySelector('.product-price'),
      allPreviewImages: allPreviewImages,
      previewImagesPerID: previewImages
    }

    this.galleryTimeline = null
    this.init()
  }

  init() {
    this.onResize()
    this.buildTimeline()
  }

  setProduct(product) {
    this.galleryTimeline && this.galleryTimeline.kill()

    if (product) {
      this.ui.title.innerHTML = product.dataset.name
      this.ui.price.innerHTML = product.dataset.price

      gsap.set(this.ui.allPreviewImages, { opacity: 0 })
      gsap.set(this.ui.previewImagesPerID[product.dataset.index], { opacity: 1 })

      this.timeline.play().then(this.startPreviewGallery(product.dataset.index))
    } else {
      this.timeline.reverse()
      this.galleryTimeline.kill()
    }
  }

  buildTimeline() {
    const { x, y } = this.armWidth

    this.timeline = gsap
      .timeline({
        paused: true,
        defaults: {
          ease: 'power2.inOut'
        }
      })
      .addLabel('preview', 0)
      .addLabel('products', 0)
      .fromTo(this.container, { opacity: 0 }, { opacity: 1 }, 'preview')
      .fromTo(this.container, { scale: 1 }, { scaleX: this.scaleFactor.x, scaleY: this.scaleFactor.y, transformOrigin: 'center center' }, 'preview')
      .to(
        this.products,
        {
          opacity: 0,
          x: (i) => {
            return i % 2 === 0 ? '2.5vw' : '-2.5vw'
          },
          y: (i) => {
            return i < 2 ? '2.5vw' : '-2.5vw'
          }
        },
        'products'
      )
      .fromTo(
        this.masked,
        {
          clipPath: `polygon(
        ${50 - x / 2}% 0%,
        ${50 + x / 2}% 0%,
        ${50 + x / 2}% ${50 - y / 2}%,
        100% ${50 - y / 2}%,
        100% ${50 + y / 2}%,
        ${50 + x / 2}% ${50 + y / 2}%,
        ${50 + x / 2}% 100%,
        ${50 - x / 2}% 100%,
        ${50 - x / 2}% ${50 + y / 2}%,
        0% ${50 + y / 2}%,
        0% ${50 - y / 2}%,
        ${50 - x / 2}% ${50 - y / 2}%
      )`
        },
        {
          clipPath: `polygon(
        50% 0%,
        50% 0%,
        50% 50%,
        100% 50%,
        100% 50%,
        50% 50%,
        50% 100%,
        50% 100%,
        50% 50%,
        0% 50%,
        0% 50%,
        50% 50%
        )`
        },
        'preview'
      )
  }

  startPreviewGallery(id) {
    const images = this.ui.previewImagesPerID[id]
    const timeline = gsap.timeline({ repeat: -1 })

    gsap.set([...images].slice(1), { opacity: 0 })

    // Start the loop — begin with second image
    images.forEach((image) => {
      timeline
        .set(images, { opacity: 0 }) // Hide all images
        .set(image, { opacity: 1 }) // Show only this one
        .to(image, { duration: 0, opacity: 1 }, '+=0.5') // Wait 0.5s before moving to next
    })

    this.galleryTimeline = timeline
  }

  onResize() {
    const { width, height } = this.container.getBoundingClientRect()
    const vw = window.innerWidth / 100

    const armWidthVw = 5
    const armWidthPx = armWidthVw * vw

    this.armWidth = {
      x: (armWidthPx / width) * 100,
      y: (armWidthPx / height) * 100
    }

    const widthInVw = width / vw
    const heightInVw = height / vw
    const shrinkVw = 5

    this.scaleFactor = {
      x: (widthInVw - shrinkVw) / widthInVw,
      y: (heightInVw - shrinkVw) / heightInVw
    }
  }
}
