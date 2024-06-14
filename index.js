import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, Flip);

document.addEventListener("DOMContentLoaded", function () {
  fetch("https://clownfish-app-pzszz.ondigitalocean.app/api")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const container = document.getElementById("dataDisplay"); // Get the container where you want to display the images
      container.innerHTML = ""; // Clear previous content

      data.data.slice(0, 4).forEach((item) => {
        // Loop through the first 4 items
        const colDiv = document.createElement("div"); // Create a new div element
        colDiv.className = "col-md-3"; // Set the class name

        const img = document.createElement("img"); // Create a new img element
        img.src = item.media_url; // Set the src attribute to the media_url of the item
        img.alt = item.username; // Set an alt attribute for accessibility (replace with actual description if available)
        img.width = 300; // Set image width
        img.height = 300; // Set image height
        colDiv.appendChild(img); // Append the img to the container
        container.appendChild(colDiv); // Append the img to the container
      });
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
  if (window.matchMedia("(min-width: 768px)").matches) {
    var tl = gsap.timeline();

    tl.to(".loader-wrapper", {
      duration: 3.5,
      ease: "power1.inOut",
      opacity: 0,
    });
  }
});
