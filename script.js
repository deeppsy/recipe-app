// https://www.uidesigndaily.com/posts/sketch-recipe-app-food-mobile-day-615

const mealsEl = document.getElementById("meals");
const favouriteContainer = document.getElementById("fav-meals");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");

const getRandomMeal = async () => {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];
  console.log(randomMeal);
  addMeal(randomMeal, true);
};

const getMealById = async (id) => {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
};

const getMealsBySearch = async (term) => {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`
  );

  const respData = await resp.json();
  const meals = respData.meals;
  return meals;
};

// *********************************
// DRIVER CODE
// **********************************
getRandomMeal();
fetchFavMeals();

// *********************************
// DRIVER CODE
// **********************************

function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `
  <div class="meal-header">
      ${
        random
          ? `<span class="random">
      Random Recipe
  </span>`
          : ""
      }
      
      <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
  </div>
  <div class="meal-body">
      <h4>${mealData.strMeal}</h4>
      <button class="fav-btn">
          <i class="fas fa-heart"></i>
      </button>
  </div> `;

  const btn = meal.querySelector(".meal-body .fav-btn");

  btn.addEventListener("click", (e) => {
    if (btn.classList.contains("active")) {
      removeMealFromLocalStarage(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealToLocalStarage(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}

function addMealToLocalStarage(mealId) {
  const mealIds = getMealFromLocalStorage();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function getMealFromLocalStorage() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

function removeMealFromLocalStarage(mealId) {
  const mealIds = getMealFromLocalStorage();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

async function fetchFavMeals() {
  // clean the conatiner first
  favouriteContainer.innerHTML = "";

  const mealIds = getMealFromLocalStorage();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);
    addMealToFav(meal);
  }
}

function addMealToFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `<img
                            src="${mealData.strMealThumb}"
                            alt="${mealData.strMeal}">
                        <span>${mealData.strMeal}</span>
                        <button class = "clear"><i class="fas fa-window-close"></i></button>
                        `;
  const btn = favMeal.querySelector(".clear");
  btn.addEventListener("click", () => {
    removeMealFromLocalStarage(mealData.idMeal);

    fetchFavMeals();
  });

  favMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favouriteContainer.appendChild(favMeal);
}

searchBtn.addEventListener("click", async () => {
  // clean the meal container
  if (searchTerm.value) {
    mealsEl.innerHTML = "";
    const term = searchTerm.value;

    const meals = await getMealsBySearch(term);

    if (meals) {
      meals.forEach((meal) => {
        addMeal(meal);
      });
    } else {
      alert(`Sorry, No meals found for ${searchTerm.value}`);
    }
  } else {
    alert("Please enter a search field");
  }
});

searchTerm.addEventListener("keyup", async (e) => {
  if (e.key === "Enter") {
    // clean the meal container

    if (searchTerm.value) {
      mealsEl.innerHTML = "";
      const term = searchTerm.value;
      const meals = await getMealsBySearch(term);

      if (meals) {
        meals.forEach((meal) => {
          addMeal(meal);
        });
      } else {
        alert(`Sorry, No meals found for ${searchTerm.value}`);
      }
    } else {
      alert("Please enter a search field");
    }
  }
});

popupCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});

function showMealInfo(mealData) {
  mealInfoEl.innerHTML = "";

  const mealEl = document.createElement("div");

  const ingredients = [];
  //get ingriedients and measures
  for (let i = 1; i <= 20; i++) {
    if (mealData[`strIngredient${i}`]) {
      ingredients.push(
        `${mealData[`strIngredient${i}`]} - ${mealData[`strMeasure${i}`]}`
      );
    } else {
      break;
    }
  }

  console.log(ingredients);

  mealInfoEl.appendChild(mealEl);

  mealEl.innerHTML = `
            <h1>${mealData.strMeal}</h1>
            <img src="${mealData.strMealThumb}"
               alt="${mealData.strMeal}">

            <p>${mealData.strInstructions}</p>
            <h3>Ingrediends</h3>
            <ul>
            ${ingredients
              .map(
                (ing) =>
                  `
            <li>${ing}</li>
            `
              )
              .join("")}
            </ul>
            
  `;

  // show the popup
  mealPopup.classList.remove("hidden");
}
