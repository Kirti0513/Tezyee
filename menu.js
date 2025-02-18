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
                <span class="dish-rating">${stars} (${dish.rating})</span>
                <p class="dish-description">${dish.description}</p>
            </div>
            <img alt="${dish.name}" src="${dish.image}" />
        </div>
        <div class="dish-footer">
            <span class="tag" onclick="filterDishes('${categoryClass}')">${dish.category}</span>
            <button class="btn" onclick="selectDish('${dish.name} - Rs ${dish.price}', this)">Add On Order</button>
        </div>
    `;

        container.appendChild(dishElement);
    });
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
    const orderList = document.getElementById("order-list");
    if (!orderList) {
        alert(`Added to Order: ${dishName}`);
        return;
    }

    const orderItem = document.createElement("li");
    orderItem.textContent = dishName;
    orderList.appendChild(orderItem);
}

// Fetch restaurant details
fetch('header.json')
    .then(response => response.json())
    .then(data => {
        document.querySelector('.restaurant-name').textContent = data.restaurantName;
        document.querySelector('.restaurant-details').textContent = `${data.address} | ${data.contact}`;
    })
    .catch(error => console.error('Error loading header data:', error));
