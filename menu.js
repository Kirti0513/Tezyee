document.addEventListener("DOMContentLoaded", function () {
    Promise.all([
        fetch("veg.json").then(response => response.json()).catch(error => console.error("Error loading veg.json:", error)),
        fetch("Nonveg.json").then(response => response.json()).catch(error => console.error("Error loading Nonveg.json:", error))
    ])
        .then(([vegData, nonvegData]) => {
            if (vegData) populateMenu(vegData, "vegetarian-menu");
            if (nonvegData) populateMenu(nonvegData, "nonvegetarian-menu");
        })
        .catch(error => console.error("Error fetching menu data:", error));
});

function populateMenu(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    data.forEach(dish => {
        if (!dish.category) return; // Ensure category exists

        const categoryClass = dish.category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const dishElement = document.createElement("div");
        dishElement.classList.add("dish", categoryClass);

        // Generate Star Rating HTML
        const stars = generateStars(dish.rating);

        let description = dish.description;
        let shortDescription = description.length > 40 ? description.substring(0, 40) + "..." : description;

        const currentHour = new Date().getHours();
        const isClosed = currentHour >= 23 || currentHour < 7;

        dishElement.innerHTML = `
    <i class="fa fa-circle" style="font-size:14px; color: ${dish.veg ? 'green' : 'red'};">
        <span class="${dish.veg ? 'vegetarian' : 'non-vegetarian'}">
            ${dish.veg ? 'VEGETARIAN' : 'NON-VEGETARIAN'}
        </span>
    </i>
    <div class="dish-content">
        <div class="dish-details">
            <div class="dish-header">
                <span class="dish-name">${dish.name}</span>
            </div>
            <div class="dish-pricing">
                <span class="dish-price">Rs ${dish.price} </span>
                <span class="original-price"> ${(dish.price * 1.2).toFixed(0)} </span>
                <div class="offer">${dish.offer || ""}</div>
            </div>
            <span class="dish-rating">${generateStars(dish.rating)} (${dish.rating})</span>
            <p class="dish-description">${dish.description}</p>
        </div>
        <img alt="${dish.name}" data-src="${dish.image}" class="lazy-img" />
    </div>
    <div class="dish-footer">
        <span class="tag" onclick="filterDishes('${categoryClass}')">${dish.category}</span>
        <button class="btn" onclick="selectDish('${dish.name} - Rs ${dish.price}', this)" 
            ${isClosed ? "disabled" : ""} style="${isClosed ? "opacity: 0.5; cursor: not-allowed;" : ""}">
            Add to Order
        </button>
    </div>
`;
        container.appendChild(dishElement);
    });
    lazyLoadImages();
    handleReadMore();
}

function lazyLoadImages() {
    const lazyImages = document.querySelectorAll(".lazy-img");

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add("fade-in");
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => observer.observe(img));
}
// Function to Generate Star Ratings
function generateStars(rating) {
    let fullStars = Math.floor(rating);
    let halfStar = rating % 1 !== 0;
    let starHTML = "";
    for (let i = 0; i < fullStars; i++) {
        starHTML += `<i class="fa fa-star" style="color: gold;"></i> `;
    }
    if (halfStar) {
        starHTML += `<i class="fa fa-star-half" style="color: gold;"></i> `;
    }
    return starHTML;
}

function handleReadMore() {
    if (window.innerWidth >= 480) return;
    document.querySelectorAll(".dish-description").forEach(desc => {
        let readMoreSpan = desc.querySelector(".read-more");
        if (readMoreSpan) {
            readMoreSpan.addEventListener("click", function () {
                if (readMoreSpan.textContent === "Read More") {
                    desc.innerHTML = desc.getAttribute("data-full") + ' <span class="read-more" style="color: blue; cursor: pointer;">Read Less</span>';
                } else {
                    desc.innerHTML = desc.getAttribute("data-short") + ' <span class="read-more" style="color: blue; cursor: pointer;">Read More</span>';
                }
                handleReadMore();
            });
        }
    });
}

window.addEventListener("resize", function () {
    document.querySelectorAll(".dish-description").forEach(desc => {
        if (window.innerWidth >= 480) {
            desc.innerHTML = desc.getAttribute("data-full");
        } else {
            desc.innerHTML = desc.getAttribute("data-short") + ' <span class="read-more" style="color: blue; cursor: pointer;">Read More</span>';
            handleReadMore();
        }
    });
});

function filterDishes(category) {
    document.querySelectorAll(".dish").forEach(dish => {
        if (category === "all") {
            dish.style.display = "block"; // Show all if "all" is selected
        } else {
            dish.style.display = dish.classList.contains(category) ? "block" : "none";
        }
    });
}
function selectDish(dishName, button) {
    const currentHour = new Date().getHours();

    if (currentHour >= 23 || currentHour < 7) {
        alert("Restaurant is closed. Orders can be placed from 7 AM to 8 PM.");
        return;
    }

    const orderList = document.getElementById("order-list");
    if (!orderList) {
        alert(`Added to Order: ${dishName}`);
        return;
    }

    const orderItem = document.createElement("li");
    orderItem.textContent = dishName;
    orderList.appendChild(orderItem);
}
document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".btn");
    const currentHour = new Date().getHours();

    if (currentHour >= 23 || currentHour < 7) {
        buttons.forEach(button => {
            button.disabled = true;
            button.style.opacity = "0.5";
            button.style.cursor = "not-allowed";
        });
    }
});


// Fetch restaurant details
fetch('header.json')
    .then(response => response.json())
    .then(data => {
        document.querySelector('.restaurant-name').textContent = data.restaurantName;
        document.querySelector('.restaurant-details').textContent = `${data.address} | ${data.contact}`;
    })
    .catch(error => console.error('Error loading header data:', error));

function sendLocationOnWhatsApp() {
    if (!whatsappNumber) {
        alert("WhatsApp number not found. Please try again later.");
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            // Use Google Maps API to get a more readable address (optional)
            var locationURL = `https://maps.google.com/?q=${latitude},${longitude}`;
            var whatsappMessage = `This is my current location: ${locationURL}`;
            var whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

            window.open(whatsappURL, '_blank');
        }, function (error) {
            alert("Unable to retrieve your location. Please enable location access.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}
