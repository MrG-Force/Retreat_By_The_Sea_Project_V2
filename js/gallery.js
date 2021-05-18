var slideIndex = 1;
showSlides(slideIndex);

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("slideshow");
    console.log(slides);
    var thumbs = document.getElementsByClassName("thumbnail")
    console.log(thumbs);
    if (n > slides.length) { 
        slideIndex = 1 
    }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < thumbs.length; i++) {
        thumbs[i].className = thumbs[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "none";
    thumbs[slideIndex - 1].className += " active";
}
function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}