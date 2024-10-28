require('dotenv').config();

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { getDatabase, ref as dbRef, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.API_KEY,
//   authDomain: process.env.AUTH_DOMAIN,
//   databaseURL: process.env.DATABASE_URL,
//   projectId: process.env.PROJECT_ID,
//   storageBucket: process.env.STORAGE_BUCKET,
//   messagingSenderId: process.env.MESSAGING_SENDER_ID,
//   appId: process.env.APP_ID,
//   measurementId: process.env.
// };


const firebaseConfig = {
    apiKey: "AIzaSyBYYHgbI13ckuX7eoHji0YggOkgcvAvZnI",
    authDomain: "sp-a-star-internship.firebaseapp.com",
    databaseURL: "https://sp-a-star-internship-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sp-a-star-internship",
    storageBucket: "sp-a-star-internship.appspot.com",
    messagingSenderId: "8071237803",
    appId: "1:8071237803:web:e9b6d608c2e72c02f667ee",
    measurementId: "G-V6CX4RE22S"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);




//Scrolling 
function scrollToElement (elementSelector, instance = 0){

    const elements = document.querySelectorAll(elementSelector);

    if(elements.length > instance){

        elements[instance].scrollIntoView({behavior: 'smooth'});
    }
}

const link1 = document.getElementById("link1"); 
const link2 = document.getElementById("link2"); 
const link3 = document.getElementById("signup");

link1.addEventListener('click',() => {
    scrollToElement('.buffer');
});

link2.addEventListener('click',() => {
    scrollToElement('.right');
});

link3.addEventListener('click',() => {
    scrollToElement('.buffer');
});









//display image
function displayImage(event) {
    const image = document.getElementById('input-image');
    image.src = URL.createObjectURL(event.target.files[0]);
    image.onload = () => {
        URL.revokeObjectURL(image.src); 
    }
}

window.displayImage = displayImage;






// scrolling revealing effect
document.addEventListener('DOMContentLoaded', () => {
    const subHeader = document.querySelector('.sub-header');
    const cards = document.querySelectorAll('.offline .card');

    const revealElement = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    };

    const options = {
        root: null, // Use the viewport as the root
        threshold: 0.5 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver(revealElement, options);
    observer.observe(subHeader); // Observe the sub-header

    cards.forEach(card => {
        observer.observe(card); // Observe each card
    });
});














// Store the uploaded image file and annotation in zip
let uploadedFile = null;
let annotationJSON = null;


function uploadImage() {
    const imageInput = document.getElementById('image');
    if (imageInput.files.length === 0) {
        alert("Please select an image to upload.");
        return;
    }
    uploadedFile = imageInput.files[0];
    alert("Image uploaded. Click 'Apply Detection' to process.");
}

window.uploadImage = uploadImage;





// async function applyDetection() {
//     if (!uploadedFile) {
//         alert("Please upload an image first.");
//         return;
//     }


//     // Show loader
//     const loader = document.getElementById('loader');
//     loader.style.display = 'block';
    

//     const formData = new FormData();
//     formData.append('file', uploadedFile);

//     try {
//         const response = await fetch('/object-detection/', {
//             method: 'POST',
//             body: formData
//         });

//         if (response.ok) {
//             // Get the zip file from the response
//             const zipBlob = await response.blob();
//             const zipFile = await JSZip.loadAsync(zipBlob);

//             // Extract the image and annotations from the zip file
//             const imageFile = zipFile.file("prediction_visual.png");
//             const annotationFile = zipFile.file("annotations.json");

//             if (imageFile && annotationFile) {
//                 // Display the image
//                 const imageBlob = await imageFile.async("blob");
//                 const imageURL = URL.createObjectURL(imageBlob);
//                 const outputImage = document.getElementById('output-image');
//                 outputImage.src = imageURL;
//                 outputImage.style.display = 'block';

//                 // Display the annotations as JSON
//                 const annotationText = await annotationFile.async("string");
//                 annotationJSON = JSON.parse(annotationText);

//             }
//         } else {
//             const errorText = await response.text();
//             console.error('Error:', errorText);
//             alert('Error: ' + errorText);
//         }
//     } catch (error) {
//         console.error('Error processing detection:', error);
//         alert('An error occurred while processing the detection.');
//     }
//     finally{
//          // Hide loader
//          loader.style.display = 'none';
//     }
// }








// Counter for unique user IDs
let imageCounter = 1; // Start with user1


async function applyDetection() {
    if (!uploadedFile) {
        alert("Please upload an image first.");
        return;
    }

    // Show loader
    const loader = document.getElementById('loader');
    loader.style.display = 'block';

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
        const response = await fetch('/object-detection/', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Get the zip file from the response
            const zipBlob = await response.blob();
            const zipFile = await JSZip.loadAsync(zipBlob);

            // Extract the image and annotations from the zip file
            const imageFile = zipFile.file("prediction_visual.png");
            const annotationFile = zipFile.file("annotations.json");

            if (imageFile && annotationFile) {
                // Display the image
                const imageBlob = await imageFile.async("blob");
                const imageURL = URL.createObjectURL(imageBlob);
                const outputImage = document.getElementById('output-image');
                outputImage.src = imageURL;
                outputImage.style.display = 'block';

                // Display the annotations as JSON
                const annotationText = await annotationFile.async("string");
                annotationJSON = JSON.parse(annotationText);

                // Upload image to Firebase Storage
                await uploadImageToFirebase(imageBlob, annotationJSON);
            }
        } else {
            const errorText = await response.text();
            console.error('Error:', errorText);
            alert('Error: ' + errorText);
        }
    } catch (error) {
        console.error('Error processing detection:', error);
        alert('An error occurred while processing the detection.');
    } finally {
        // Hide loader
        loader.style.display = 'none';
    }
}

// Upload image to Firebase Storage and store the image URL and annotations in Realtime Database
async function uploadImageToFirebase(imageBlob, annotationJSON) {


     // Create a unique filename by appending the counter
     const uniqueFileName = `prediction_visual_${imageCounter}.png`;

     // Convert the Blob to a File object with a unique name
     const file = new File([imageBlob], uniqueFileName, { type: "image/png" });

    try {
        if (!file) {
            console.log("No file selected.");
            return;
        }
    
        // Define the storage reference
        const mountainsRef = ref(storage, `images/${file.name}`);
    
        // Upload the file
        uploadBytes(mountainsRef, file).then((snapshot) => {
            console.log('Uploaded a blob or file!');
    
            // Get the download URL
            getDownloadURL(mountainsRef).then((downloadURL) => {
                console.log('File available at', downloadURL);
                // Store the URL and JSON data in the Realtime Database
                writeDataToDatabase(downloadURL,annotationJSON);
            });

            
        }).catch((error) => {
            console.error("Error uploading file:", error);
        });

    } catch (error) {
        console.error("Error uploading to Firebase:", error);
    }
}

window.applyDetection = applyDetection;


// Write data (image URL and annotations) to Firebase Realtime Database
function writeDataToDatabase(imageUrl, jsonAnnotation) {
     // Create a unique user ID
     const imageId = `image${imageCounter++}`; // Increment the counter for the next user

     // Example JSON data
     const jsonData = jsonAnnotation
 
     // Store the data in the Realtime Database
     set(dbRef(database, 'Defects/' + imageId), {
         image_url: imageUrl,
         annotations: jsonData
     })
     .then(() => {
         console.log("Data saved successfully.");
     })
     .catch((error) => {
         console.error("Error saving data:", error);
     });
}









// Display the graph and remove the previous instance
let defectChartInstance = null;
let areaChartInstance = null;

function loadAndDisplayCharts() {

    if (!annotationJSON) {
        alert("Please apply detection first to load annotations.");
        return;
    }


    const jsonData = annotationJSON;

    const defectCounts = { "Nicks": 0, "Dents": 0, "Scratches": 0, "Pittings": 0 };
    const defectAreas = { "Nicks": [], "Dents": [], "Scratches": [], "Pittings": [] };

    jsonData.forEach(item => {
        if (item.category_name in defectCounts) {
            defectCounts[item.category_name]++;
            defectAreas[item.category_name].push(item.area);
        }
    });

    const xValues = ["Nicks", "Dents", "Scratches", "Pittings"];
    const yValuesCounts = [
        defectCounts["Nicks"],
        defectCounts["Dents"],
        defectCounts["Scratches"],
        defectCounts["Pittings"]
    ];
    const barColors = ["#FF3838", "#FF9D97", "#FF701F", "#FFB21D"];

    if (defectChartInstance) {
        defectChartInstance.destroy();
    }

    defectChartInstance = new Chart("defectChart", {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [{
                label: "Defect Counts",
                backgroundColor: barColors,
                data: yValuesCounts
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: "Defect Counts"
            }
        }
    });

    const areaDatasets = [
        {
            label: "Nicks",
            data: defectAreas["Nicks"],
            borderColor: "#FF3838",
            fill: false
        },
        {
            label: "Dents",
            data: defectAreas["Dents"],
            borderColor: "#FF9D97",
            fill: false
        },
        {
            label: "Scratches",
            data: defectAreas["Scratches"],
            borderColor: "#FF701F",
            fill: false
        },
        {
            label: "Pittings",
            data: defectAreas["Pittings"],
            borderColor: "#FFB21D",
            fill: false
        }
    ];

    const maxDataPoints = Math.max(...Object.values(defectAreas).map(arr => arr.length));
    const labels = Array.from({length: maxDataPoints}, (_, i) => i + 1);

    if (areaChartInstance) {
        areaChartInstance.destroy();
    }

    areaChartInstance = new Chart("areaChart", {
        type: "line",
        data: {
            labels: labels,
            datasets: areaDatasets
        },
        options: {
            legend: { display: true },
            title: {
                display: true,
                text: "Distribution of Defect Areas by Type"
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Area"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Data Point"
                    }
                }
            }
        }
    });
}

window.loadAndDisplayCharts = loadAndDisplayCharts;


// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




// Store the uploaded image file 

//  let uploadedFile = null;

//  function uploadImage() {
//      const imageInput = document.getElementById('image');
//      if (imageInput.files.length === 0) {
//          alert("Please select an image to upload.");
//          return;
//      }
//      uploadedFile = imageInput.files[0];
//      alert("Image uploaded. Click 'Apply Detection' to process.");
//  }

//  async function applyDetection() {
//      if (!uploadedFile) {
//          alert("Please upload an image first.");
//          return;
//      }

//      const formData = new FormData();

//      //for standard inference
//      // formData.append('image', uploadedFile);

//      //for sahi inference
//      formData.append('file', uploadedFile);


//      const response = await fetch('/object-detection/', {
//          method: 'POST',
//          body: formData
//      });

//      console.log(response)

//      if (response.ok) {
//          const blob = await response.blob();
//          const url = URL.createObjectURL(blob);
//          const outputImage = document.getElementById('output-image');
//          outputImage.src = url;
//          outputImage.style.display = 'block';
//      } else {
//          const errorText = await response.text(); // Get the error text
//          console.error('Error:', errorText); // Log the error
//          alert('Error: ' + errorText); // Display the error to the user
//      }

//  }








// Display Graph wihtout removing the previous instance
// function loadAndDisplayCharts() {

//     if (!annotationJSON) {
//         alert("Please apply detection first to load annotations.");
//         return;
//     }


//     // Sample JSON data (replace with your JSON file path)
//     const jsonData = annotationJSON

//     // Initialize counters and area accumulators for each defect type
//     const defectCounts = { "Nicks": 0, "Dents": 0, "Scratches": 0, "Pittings": 0 };
//     const defectAreas = { "Nicks": [], "Dents": [], "Scratches": [], "Pittings": [] };

//     // Count occurrences and accumulate areas of each defect in the JSON data
//     jsonData.forEach(item => {
//         if (item.category_name in defectCounts) {
//             defectCounts[item.category_name]++;
//             defectAreas[item.category_name].push(item.area);
//         }
//     });

//     // Prepare data for bar chart showing counts
//     const xValues = ["Nicks", "Dents", "Scratches", "Pittings"];
//     const yValuesCounts = [
//         defectCounts["Nicks"],
//         defectCounts["Dents"],
//         defectCounts["Scratches"],
//         defectCounts["Pittings"]
//     ];
//     const barColors = ["#FF3838", "#FF9D97", "#FF701F", "#FFB21D"];

//     // Create defect count bar chart
//     new Chart("defectChart", {
//         type: "bar",
//         data: {
//             labels: xValues,
//             datasets: [{
//                 label: "Defect Counts",
//                 backgroundColor: barColors,
//                 data: yValuesCounts
//             }]
//         },
//         options: {
//             legend: { display: false },
//             title: {
//                 display: true,
//                 text: "Defect Counts"
//             }
//         }
//     });

//     // Prepare datasets for line chart showing area distribution for each defect type
//     const areaDatasets = [
//         {
//             label: "Nicks",
//             data: defectAreas["Nicks"],
//             borderColor: "#FF3838",
//             fill: false
//         },
//         {
//             label: "Dents",
//             data: defectAreas["Dents"],
//             borderColor: "#FF9D97",
//             fill: false
//         },
//         {
//             label: "Scratches",
//             data: defectAreas["Scratches"],
//             borderColor: "#FF701F",
//             fill: false
//         },
//         {
//             label: "Pittings",
//             data: defectAreas["Pittings"],
//             borderColor: "#FFB21D",
//             fill: false
//         }
//     ];

//     // Determine maximum label count to standardize x-axis labels
//     const maxDataPoints = Math.max(...Object.values(defectAreas).map(arr => arr.length));
//     const labels = Array.from({length: maxDataPoints}, (_, i) => i + 1);

//     // Create the line chart for area distribution
//     new Chart("areaChart", {
//         type: "line",
//         data: {
//             labels: labels,
//             datasets: areaDatasets
//         },
//         options: {
//             legend: { display: true },
//             title: {
//                 display: true,
//                 text: "Distribution of Defect Areas by Type"
//             },
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     title: {
//                         display: true,
//                         text: "Area"
//                     }
//                 },
//                 x: {
//                     title: {
//                         display: true,
//                         text: "Data Point"
//                     }
//                 }
//             }
//         }
//     });
// }

