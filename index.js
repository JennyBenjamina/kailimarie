import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, Flip);

//loader

// GSAP animations

document.addEventListener("DOMContentLoaded", function () {
  var tl = gsap.timeline();

  tl.from(".loader-wrapper", {
    duration: 0.5,
    y: "-100%",
    ease: "power1.out",
  })
    .to(
      ".loader",
      {
        duration: 0.5,
        y: "-100vh",
        ease: "power1.out",
      },
      "+=0.5"
    )
    .to(
      ".loader-wrapper",
      {
        duration: 0.5,
        opacity: 0,
        onComplete: function () {
          document.querySelector(".loader-wrapper").style.display = "none";
        },
      },
      "+=0.5"
    );
});
//loader
// bee

gsap.set("#motionSVG", { scale: 0.85, autoAlpha: 1 });
gsap.set("#bee", { transformOrigin: "50% 50%", scaleX: -1 });
let getProp = gsap.getProperty("#motionSVG"),
  flippedX = false,
  flippedY = false;

gsap.to("#motionSVG", {
  scrollTrigger: {
    trigger: "#motionPath",
    start: "top center",
    end: "bottom center",
    scrub: 0.7,
    markers: false,
    onUpdate: (self) => {
      let rotation = getProp("rotation"),
        flipY = Math.abs(rotation) > 90,
        flipX = self.direction === 1;
      if (flipY !== flippedY || flipX !== flippedX) {
        gsap.to("#bee", {
          scaleY: flipY ? -1 : 1,
          scaleX: flipX ? -1 : 1,
          duration: 0.25,
        });
        flippedY = flipY;
        flippedX = flipX;
      }
    },
  },
  duration: 10,
  ease: pathEase("#motionPath", { smooth: true }), // <-- MAGIC!
  immediateRender: true,
  motionPath: {
    path: "#motionPath",
    align: "#motionPath",
    alignOrigin: [0.5, 0.5],
    autoRotate: 0,
  },
});

/* 
Helper function that returns an ease that bends time to ensure the target moves on the y axis in a relatively steady fashion in relation to the viewport (assuming the progress of the tween is linked linearly to the scroll position). Requires MotionPathPlugin of course.
You can optionally pass in a config option with any of these properties: 
  - smooth: if true, the target can drift slightly in order to smooth out the movement. This is especially useful if the path curves backwards at times. It prevents super-fast motions at that point. You can define it as a number (defaults to 7) indicating how much to smooth it.
  - precision: number (defaults to 1) controlling the sampling size along the path. The higher the precision, the more accurate but the more processing.
  - axis: "y" or "x" ("y" by default)
*/
function pathEase(path, config = {}) {
  let axis = config.axis || "y",
    precision = config.precision || 1,
    rawPath = MotionPathPlugin.cacheRawPathMeasurements(
      MotionPathPlugin.getRawPath(gsap.utils.toArray(path)[0]),
      Math.round(precision * 12)
    ),
    useX = axis === "x",
    start = rawPath[0][useX ? 0 : 1],
    end =
      rawPath[rawPath.length - 1][
        rawPath[rawPath.length - 1].length - (useX ? 2 : 1)
      ],
    range = end - start,
    l = Math.round(precision * 200),
    inc = 1 / l,
    positions = [0],
    a = [],
    minIndex = 0,
    smooth = [0],
    minChange = (1 / l) * 0.6,
    smoothRange = config.smooth === true ? 7 : Math.round(config.smooth) || 0,
    fullSmoothRange = smoothRange * 2,
    getClosest = (p) => {
      while (positions[minIndex] <= p && minIndex++ < l) {}
      a.push(
        a.length &&
          ((p - positions[minIndex - 1]) /
            (positions[minIndex] - positions[minIndex - 1])) *
            inc +
            minIndex * inc
      );
      smoothRange &&
        a.length > smoothRange &&
        a[a.length - 1] - a[a.length - 2] < minChange &&
        smooth.push(a.length - smoothRange);
    },
    i = 1;
  for (; i < l; i++) {
    positions[i] =
      (MotionPathPlugin.getPositionOnPath(rawPath, i / l)[axis] - start) /
      range;
  }
  positions[l] = 1;
  for (i = 0; i < l; i++) {
    getClosest(i / l);
  }
  a.push(1); // must end at 1.
  if (smoothRange) {
    // smooth at the necessary indexes where a small difference was sensed. Make it a linear change over the course of the fullSmoothRange
    smooth.push(l - fullSmoothRange + 1);
    smooth.forEach((i) => {
      let start = a[i],
        j = Math.min(i + fullSmoothRange, l),
        inc = (a[j] - start) / (j - i),
        c = 1;
      i++;
      for (; i < j; i++) {
        a[i] = start + inc * c++;
      }
    });
  }
  return (p) => {
    let i = p * l,
      s = a[i | 0];
    return i ? s + (a[Math.ceil(i)] - s) * (i % 1) : 0;
  };
}

//bee

//test

gsap.utils.toArray(".comparisonSection").forEach((section) => {
  // i need to console log when the section is at the center of the viewport
  console.log(window.innerHeight / 2);
  console.log(section.height / 2);
  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "center center",
      // makes the height of the scrolling (while pinning) match the width, thus the speed remains constant (vertical/horizontal)
      end: () => "+=" + section.offsetWidth,
      scrub: true,
      pin: true,
      anticipatePin: 1,
    },
    defaults: { ease: "none" },
  });
  // animate the container one way...
  tl.fromTo(
    section.querySelector(".afterImage"),
    { xPercent: 100, x: 0 },
    { xPercent: 0 }
  )
    // ...and the image the opposite way (at the same time)
    .fromTo(
      section.querySelector(".afterImage img"),
      { xPercent: -100, x: 0 },
      { xPercent: 0 },
      0
    );
});

// test

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".accordions",
    pin: true,
    start: "top top",
    end: "bottom top",
    scrub: 1,
    ease: "linear",
  },
});

tl.to(".accordion .text", {
  height: 0,
  paddingBottom: 0,
  opacity: 0,
  stagger: 0.5,
});
tl.to(".accordion", {
  marginBottom: -15,
  stagger: 0.5,
});

// using flip

const allCheckbox = document.querySelector("#all"),
  filters = gsap.utils.toArray(".filter"),
  items = gsap.utils.toArray(".item");

function updateFilters() {
  const state = Flip.getState(items), // get the current state
    classes = filters
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => "." + checkbox.id),
    matches = classes.length ? gsap.utils.toArray(classes.join(",")) : classes;

  // adjust the display property of each item ("none" for filtered ones, "inline-flex" for matching ones)
  items.forEach(
    (item) =>
      (item.style.display =
        matches.indexOf(item) === -1 ? "none" : "inline-flex")
  );

  // animate from the previous state
  Flip.from(state, {
    duration: 1,
    scale: true,
    absolute: true,
    ease: "power1.inOut",
    onEnter: (elements) =>
      gsap.fromTo(
        elements,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 1 }
      ),
    onLeave: (elements) =>
      gsap.to(elements, { opacity: 0, scale: 0, duration: 1 }),
  });

  // Update the all checkbox:
  allCheckbox.checked = matches.length === items.length;
}

filters.forEach((btn) => btn.addEventListener("click", updateFilters));
allCheckbox.addEventListener("click", () => {
  filters.forEach((checkbox) => (checkbox.checked = allCheckbox.checked));
  updateFilters();
});
