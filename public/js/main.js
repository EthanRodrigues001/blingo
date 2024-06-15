/*=============== SHOW SIDEBAR ===============*/
const showSidebar = (toggleId, sidebarId, mainId) =>{
   const toggle = document.getElementById(toggleId),
   sidebar = document.getElementById(sidebarId),
   main = document.getElementById(mainId)

   if(toggle && sidebar && main){
       toggle.addEventListener('click', ()=>{
           /* Show sidebar */
           sidebar.classList.toggle('show-sidebar')
           /* Add padding main */
           main.classList.toggle('main-pd')
       })
   }
}
showSidebar('header-toggle','sidebar', 'main')

/*=============== LINK ACTIVE ===============*/
const sidebarLink = document.querySelectorAll('.sidebar__link')

function linkColor(){
    sidebarLink.forEach(l => l.classList.remove('active-link'))
    this.classList.add('active-link')
}

sidebarLink.forEach(l => l.addEventListener('click', linkColor))

//snow
// Get the modal
var modal = document.getElementById("snowEffectModal");

// Get the button that opens the modal
var btn = document.getElementById("openModalBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


// copy

function copyApiKey(event) {
  event.preventDefault(); // Prevent default anchor behavior

  // Get the text content of the paragraph within the clicked anchor's parent element
  const apiKey = event.target.parentElement.querySelector('.text').textContent;

  // Create a temporary input element
  const tempInput = document.createElement('input');
  tempInput.setAttribute('type', 'text');
  tempInput.setAttribute('value', apiKey);
  document.body.appendChild(tempInput);

  // Select the text in the input element
  tempInput.select();
  tempInput.setSelectionRange(0, 99999); // For mobile devices

  // Copy the selected text
  document.execCommand('copy');

  // Remove the temporary input element
  document.body.removeChild(tempInput);

  // Optionally, provide feedback to the user
  alert('API key copied to clipboard!');
}

/*=============== SCROLL REVEAL ANIMATION ===============*/
document.addEventListener('DOMContentLoaded', function () {
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            origin: 'top',
            distance: '80px',
            duration: 2500,
            delay: 300,
        });

        sr.reveal('.home__img, .home__data');
        sr.reveal('.new__data, .care__img, .contact__content, .footer');
        sr.reveal('.care__list, .contact__img', { delay: 500 });
        sr.reveal('.new__card', { delay: 500, interval: 100 });
        sr.reveal('.shop__card', { interval: 100 });
    } else {
        console.error('ScrollReveal is not loaded');
    }
});


    document.addEventListener("DOMContentLoaded", function () {
        const toast = document.querySelector('.toast');
        const progress = document.querySelector('.progress');
        const closeIcon = document.querySelector('.close');

        if (toast.classList.contains('active')) {
            const hideToast = () => {
                toast.classList.remove('active');
                setTimeout(() => {
                    progress.classList.remove('active');
                }, 300);
            };

            setTimeout(hideToast, 5000);

            closeIcon.addEventListener('click', hideToast);
        }
    });


let copyText = document.querySelector(".copy-text");
copyText.querySelector("button").addEventListener("click", function () {
    let input = copyText.querySelector("input.text");
    input.select();
    document.execCommand("copy");
    copyText.classList.add("active");
    window.getSelection().removeAllRanges();
    setTimeout(function () {
        copyText.classList.remove("active");
    }, 2500);
});