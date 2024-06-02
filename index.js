import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, Flip);

document.addEventListener("DOMContentLoaded", function () {
  if (window.matchMedia("(min-width: 768px)").matches) {
    gsap.set("#motionSVG", { scale: 0.85, autoAlpha: 1 });
    gsap.set("#bee", { transformOrigin: "10% 50%", scaleX: -1 });

    let getProp = gsap.getProperty("#motionSVG"),
      flippedX = false,
      flippedY = false;

    var tl = gsap.timeline();

    tl.to(".loader-wrapper", {
      duration: 3.5,
      ease: "power1.inOut",
      opacity: 0,
    })
      .to("#bee-scroll", {
        duration: 0.5,
        opacity: 1,
      })
      .to("#motionSVG", {
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

            // if (flipY !== flippedY || flipX !== flippedX) {
            // Get the position of the #motionSVG
            let svgPos = document
              .querySelector("#motionSVG")
              .getBoundingClientRect();

            // Get all the images
            let images = document.querySelectorAll(".image-path");

            // Find the image closest to the #motionSVG
            let closestImage = [...images].reduce((closest, image) => {
              let imagePos = image.getBoundingClientRect();
              let svgDistance = Math.hypot(
                svgPos.x - imagePos.x,
                svgPos.y - imagePos.y
              );
              let closestDistance = closest
                ? Math.hypot(svgPos.x - closest.x, svgPos.y - closest.y)
                : Infinity;
              console.log("imgpos", imagePos);
              return svgDistance < closestDistance ? image : closest;
            }, null);

            console.log("svgpos", svgPos);

            // Flip the closest image
            gsap.to(closestImage, {
              scaleY: flipY ? -1 : 1,
              scaleX: flipX ? -1 : 1,
              duration: 1,
            });

            flippedY = flipY;
            flippedX = flipX;
            // }
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

    // Get the images
    let images = document.querySelectorAll(".image-path");

    // Initial animation to move the images to the start of the path
    tl.to(images, {
      duration: 1,
      y: "100vh", // Move the images off the page
      ease: "power1.inOut",
      stagger: function () {
        return Math.random() * 0.5;
      },
    });

    tl.to(images, {
      duration: 3,
      ease: "power1.inOut",
      motionPath: {
        path: "#motionPath",
        align: "#motionPath",
        alignOrigin: [0.5, 0.5],
        end: function (index, target, targets) {
          return (index + 1) / targets.length;
        },
      },
    });
  }
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
