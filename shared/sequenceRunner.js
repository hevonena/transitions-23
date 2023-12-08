async function loadIframe(url, target) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.addEventListener("load", (ev) => {
      resolve(iframe);
    });
    target.appendChild(iframe);
  });
}

export async function runSequence(urls) {
  const main = document.querySelector("main");

  const sketches = [];
  let currentSketchId = -1;

  const debug = document.querySelector(".debug");
  let params = new URLSearchParams(document.location.search);
  if (params.has("debug")) {
    debug.style.display = "block";
  }
  console.log(params);

  for (const url of urls) {
    sketches.push({
      url: url,
      iframe: await loadIframe(url, main),
    });
  }

  setSketch(0);
  main.style.visibility = "visible";

  function setSketch(id) {
    const prev = sketches[currentSketchId];
    if (prev) {
      prev.iframe.style = "z-index:-99";
      prev.iframe.src = prev.iframe.src;
    }

    currentSketchId = id;

    const newSketch = sketches[currentSketchId];
    if (newSketch) {
      newSketch.iframe.style = "z-index:99;";
      debug.innerHTML = new URL(newSketch.iframe.src).pathname;
    }
  }

  function next() {
    const nextId = (currentSketchId + 1) % sketches.length;
    setSketch(nextId);
  }

  window.addEventListener(
    "message",
    (event) => {
      if (event.data === "finished") {
        console.log("received message to move to next sketch");
        next();
      }
    },
    false
  );
}

export async function runRandomSequence(urls) {
  let currentSequence = 0;
  let currentStudent = "random";

  const main = document.querySelector("main");
  main.style.visibility = "visible";

  const studentName = document.getElementById("studentName");
  const index = document.getElementById("index");
  const menu = document.getElementById("menu");
  const close = document.getElementById("close-menu");

  // on index click toggle menu div visibility
  index.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  // on li with class student click filter the sequence
  menu.addEventListener("click", (e) => {
    if (e.target.classList.contains("student")) {
      let filteredStudent = e.target.getAttribute("student-name");

      menu.classList.toggle("hidden");
      currentStudent = filteredStudent;

      // if current student highlight the li
      document
        .querySelectorAll(".student")
        .forEach((link) =>
          link.classList.toggle(
            "selected",
            link.getAttribute("student-name") === currentStudent
          )
        );
      // remove all iframes
      main.querySelectorAll("iframe").forEach((iframe) => {
        main.removeChild(iframe);
      });

      // load First if random else load first of student
      const index = urls.findIndex((item) => item.student === currentStudent);
      currentSequence = currentStudent === "random" ? 0 : index;
      loadFirst();
    }
  });

  close.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  // Fill menu
  const studentNames = urls
    .map((item) => item.student)
    .filter((value, index, self) => self.indexOf(value) === index);
  const liElements = studentNames.map(
    (name) => `<li class="student link" student-name="${name}">${name}</li>`
  );
  const ulInnerHTML = liElements.join("");

  // get div with id inside menu div
  const studentList = document.getElementById("studentList");
  studentList.innerHTML = `<ul><li class="student link selected" student-name="random">Random</li>${ulInnerHTML}</ul>`;

  let firstIframe;
  let transition;
  let previousSketch = null;

  async function loadFirst() {
    firstIframe = true;
    // Load the first iframe at beginning
    const first = {
      url: urls[currentSequence].url,
      iframe: await loadIframe(urls[currentSequence].url, main),
    };

    if (first) {
      console.log("first", first);
      first.iframe.style = "z-index:99";
      first.iframe.contentWindow.focus();
      first.iframe.src = first.iframe.src;
    }

    nextSequence();
  }

  // First
  loadFirst();

  async function setNext(nextSketch) {
    if (!firstIframe) {
      main.removeChild(main.querySelector("iframe"));
      main.querySelector("iframe").style = "z-index:99";
      main.querySelector("iframe").contentWindow.focus();
    }

    firstIframe = false;

    const next = {
      url: nextSketch.url,
      iframe: await loadIframe(nextSketch.url, main),
    };

    if (next) {
      next.iframe.style = "z-index:-99";
      next.iframe.src = next.iframe.src;
    }

    //set timeout to fade out studentName
    clearTimeout(transition);

    transition = setTimeout(() => {
      studentName.style.opacity = "0";
    }, 3000);

    // only show student name if currentStudent is random
    if (previousSketch.student && currentStudent == "random") {
      studentName.innerHTML = previousSketch.student;
      studentName.style.opacity = "1";
    } else {
      studentName.innerHTML = "";
      studentName.style.opacity = "0";
    }

    // set index number
    let sequencesToUse =
      currentStudent === "random"
        ? urls
        : urls.filter((seq) => seq.student === currentStudent);

    const currentSequenceObject = previousSketch;
    const currentSequenceIndex = sequencesToUse.findIndex(
      (seq) => seq === currentSequenceObject
    );

    index.innerHTML = `<div class="link">${currentSequenceIndex + 1}/${
      sequencesToUse.length
    }</div>`;
  }

  function nextSequence() {
    previousSketch = urls[currentSequence];

    const nextSequence = selectNextSequence(
      urls[currentSequence].end,
      urls,
      currentStudent
    );
    currentSequence = nextSequence;
    setNext(urls[nextSequence]);
  }

  window.addEventListener(
    "message",
    async (event) => {
      if (event.data === "finished") {
        nextSequence();
      }
    },
    false
  );
}

function selectNextSequence(endShape, urls, currentStudent) {
  const matchingSequences = urls
    .map((seq, index) => ({ seq, index })) // Map each sequence to an object with the sequence and its index
    .filter(({ seq }) => {
      // Filter based on the endShape and, if currentStudent is provided, also filter by student name
      return (
        seq.begin === endShape &&
        (currentStudent === "random" || seq.student === currentStudent)
      );
    });

  if (matchingSequences.length > 0) {
    const randomIndex = Math.floor(Math.random() * matchingSequences.length);
    return matchingSequences[randomIndex].index; // Return the index of the selected sequence
  } else if (currentStudent !== "random") {
    // If no match is found and currentStudent is provided, try to find the first sequence for the currentStudent
    const studentSequences = urls
      .map((seq, index) => ({ seq, index }))
      .filter(({ seq }) => seq.student === currentStudent);

    if (studentSequences.length > 0) {
      return studentSequences[0].index;
    }
  }

  return 0; // Return 0 if no matching sequence is found
}

/**
 * This tells the sequence runner (which has the sketch loaded as an iframe) that this sketch is finished. The next sketch will be activated.
 */
export function sendSequenceNextSignal() {
  console.log("sketch finished, starting the next one.");
  window.parent.postMessage("finished", "*");
}

export async function loadSequenceMetadata(urls) {
  let sequenceData = await Promise.all(
    urls.map(async (url) => {
      const infoUrl = url + "/info.json";
      try {
        const response = await fetch(infoUrl);
        const data = await response.json();
        return Object.assign(
          {},
          {
            url: url,
          },
          data
        );
      } catch (e) {}
    })
  );
  sequenceData = sequenceData.filter((o) => o !== undefined);

  return sequenceData;
}
