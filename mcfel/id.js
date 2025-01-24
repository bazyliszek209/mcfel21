// Funkcja wczytująca dane z pliku dane.txt
function loadDataFromFile() {
  fetch('dane.txt')
    .then(response => {
      if (!response.ok) {
        throw new Error('Nie udało się wczytać pliku dane.txt');
      }
      return response.text();
    })
    .then(text => {
      const data = parseData(text);

      // Przypisz wartości do zmiennych i elementów DOM
      const firstname = data.firstname || "";
      const surname = data.surname || "";
      const borndate = data.borndate || "";
      const pesel = data.pesel || "";
      const image = data.image || "";

      document.querySelector(".surname").innerHTML = surname.toUpperCase();
      document.querySelector(".firstname").innerHTML = firstname.toUpperCase();
      document.querySelector(".pesel").innerHTML = pesel.toUpperCase();
      document.querySelector(".borndate").innerHTML = borndate.toUpperCase();

      if (image) {
        document.querySelector('.id_own_image').style.backgroundImage = `url('${image}')`;
      }
    })
    .catch(error => {
      console.error('Błąd podczas wczytywania danych:', error);
    });
}

// Funkcja parsująca dane z formatu key=value
function parseData(text) {
  const lines = text.split('\n');
  const data = {};
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      data[key.trim()] = value.trim();
    }
  });
  return data;
}

// Wywołanie funkcji wczytującej dane po załadowaniu DOM
window.addEventListener('DOMContentLoaded', () => {
  loadDataFromFile();
  getImageFromIndexedDB();
});

// Reszta kodu pozostaje bez zmian...
function getImageFromIndexedDB() {
  const request = indexedDB.open("PWAStorage", 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images", { keyPath: "id" });
    }
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction("images", "readonly");
    const store = transaction.objectStore("images");
    const getRequest = store.get("profileImage");

    getRequest.onsuccess = () => {
      if (getRequest.result) {
        console.log("Retrieved image from IndexedDB:", getRequest.result.data);
        document.querySelector('.id_own_image').style.backgroundImage = `url('${getRequest.result.data}')`;
      } else {
        console.log("No image found in IndexedDB.");
        showImageUploadOption(); // Show upload option if no image found
      }
    };

    getRequest.onerror = (err) => {
      console.error("Error retrieving image from IndexedDB:", err);
    };
  };

  request.onerror = (err) => {
    console.error("Error opening IndexedDB:", err);
  };
}

function showImageUploadOption() {
  console.log("Showing upload option.");

  // Create a container for the overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent background
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000'; // Ensures it's on top of other elements

  // Append the upload container to the overlay
  overlay.appendChild(uploadContainer);
  document.body.appendChild(overlay);

  // Add event listener for file upload
  const imageUploadInput = document.getElementById('image-upload');
  imageUploadInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imageDataUrl = e.target.result;
        storeImageInIndexedDB(imageDataUrl); // Store in IndexedDB
        document.querySelector('.id_own_image').style.backgroundImage = `url('${imageDataUrl}')`; // Set as background
        overlay.remove(); // Remove overlay once image is set
      };
      reader.readAsDataURL(file);
    }
  });

  // Add event listener for cancel button to close the overlay
  const closeButton = document.getElementById('close-upload');
  closeButton.addEventListener('click', () => {
    overlay.remove();
  });
}

function storeImageInIndexedDB(imageDataUrl) {
  const request = indexedDB.open("PWAStorage", 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images", { keyPath: "id" });
    }
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction("images", "readwrite");
    const store = transaction.objectStore("images");
    const putRequest = store.put({ id: "profileImage", data: imageDataUrl });

    putRequest.onsuccess = () => {
      console.log("Image stored successfully in IndexedDB.");
    };

    putRequest.onerror = (err) => {
      console.error("Error storing image in IndexedDB:", err);
    };
  };

  request.onerror = (err) => {
    console.error("Error opening IndexedDB:", err);
  };
}
