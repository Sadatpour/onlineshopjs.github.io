import { productsData } from "./products.js";
// Variables access
const cartClick = document.querySelector(".header .icons");
const cartBackDrop = document.querySelector(".backdrop");
const cartModal = document.querySelector(".cart");
const confirmBtn = document.querySelector(".cart-item-confirm");
const productsDiv = document.querySelector(".products");
const cartItems = document.querySelector(".cart-counter");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");
const menuBackDrop = document.querySelector(".menu-backdrop");
const showMenu = document.querySelector(".menu-content");
const menuBar = document.querySelector(".header .fa-bars");
const closeMenu = document.querySelector(".close-icon");

let cart = [];

//1- get products
class Products {
  getProducts() {
    return productsData;
  }
}
let buttonsDom = [];
//2- display products
class Ui {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      result += `
      <div class="product">
        <img src=${item.imageUrl} alt=${item.title}/>
        <div class="info">
          <i class="fas fa-dollar-sign"></i>
          <p>${item.price}</p>
          <h3>${item.title}</h3>
        </div>
        <div class="addtocart">
          <button class="addtocartbtns" data-id= ${item.id}>add to cart </button>
        </div>
      </div>`;
      productsDiv.innerHTML = result;
    });
  }
  getAddToCart() {
    const addToCart = [...document.querySelectorAll(".addtocartbtns")];
    buttonsDom = addToCart;
    addToCart.forEach((btn) => {
      const id = btn.dataset.id;
      // check if product existing in cart or no!
      const isInCart = cart.find((p) => p.id === id);
      if (isInCart) {
        btn.innerText = `in cart!`;
        btn.Disabled = true;
      }
      btn.addEventListener("click", (event) => {
        //console.log(event.target.dataset.id);
        event.target.innerText = `in cart!`;
        event.target.style.color = "green";
        event.target.style.backgroundColor = "#ccc";
        event.target.style.cursor = "not-allowed";
        event.target.disabled = true;
        //1- get products
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };

        //2- add to cart
        cart = [...cart, addedProduct];
        //3- save to local storage
        Storage.saveCart(cart);

        //4- update cart value
        this.setCartValue(cart);

        //5- add to cart modal
        this.addCartItem(addedProduct);

        //6- get cart from storage
      });
    });
  }
  setCartValue(cart) {
    //1. cart items
    //2. cart total price
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `Total Price : $ ${totalPrice.toFixed(2)}  `;
    cartItems.innerText = tempCartItems;
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    cart = [...cart];
    div.innerHTML = `
      <img src=${cartItem.imageUrl} alt="" class="cart-iem-img" />
      <div class="cart-item-desc">
          <h4>${cartItem.title} </h4>
          <h5>$ ${cartItem.price} </h5>
      </div>
      <div class="cart-item-controller">
        <i class="fas fa-minus-circle " data-id=${cartItem.id}></i>
        <p>${cartItem.quantity} </p>
        <i class="fas fa-plus-circle" data-id=${cartItem.id}></i>
      </div>
      <div class="cart-item-delete">
          <i class="fas fa-trash" data-id=${cartItem.id}></i>
      </div>`;
    cartContent.appendChild(div);
  }
  setupApp() {
    // get cart from storage
    cart = Storage.getCart();
    // set values : price + item
    this.setCartValue(cart);
    this.populateCart(cart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  cartLogic() {
    clearCart.addEventListener("click", () => this.clearCart());
    // cart plus, minus and delete icon
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-plus-circle")) {
        const addQty = event.target;
        const pluseItem = cart.find((cItem) => cItem.id == addQty.dataset.id);
        pluseItem.quantity++;
        //2 update cart valuu
        this.setCartValue(cart);
        //3. save local storage
        Storage.saveCart(cart);
        //4. update cart qty  between plus and minus icons
        addQty.previousElementSibling.innerText = pluseItem.quantity;
      } else if (event.target.classList.contains("fa-trash")) {
        const removeItem = event.target;
        const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);
        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement.parentElement);
      } else if (event.target.classList.contains("fa-minus-circle")) {
        const minusQty = event.target;
        const minusItem = cart.find((cItem) => cItem.id == minusQty.dataset.id);
        if (minusItem.quantity === 1) {
          this.removeItem(minusItem.id);
          cartContent.removeChild(minusQty.parentElement.parentElement);
          return;
        }
        minusItem.quantity--;
        //2 update cart valuu
        this.setCartValue(cart);
        //3. save local storage
        Storage.saveCart(cart);
        //4. update cart qty  between plus and minus icons
        minusQty.nextElementSibling.innerText = minusItem.quantity;
      }
    });
  }
  clearCart() {
    //remove item
    cart.forEach((cItem) => this.removeItem(cItem.id));
    //remove cart content children
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    //close cart
    closeCartFn();
  }
  removeItem(id) {
    //update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    //total price and cart item
    this.setCartValue(cart);
    //update storage
    Storage.saveCart(cart);
    const button = this.buttonRefresh(id);
    button.innerText = " add to cart";
    button.style.color = "#fff";
    button.style.backgroundColor = "#54433e";
    button.style.cursor = "pointer";
    button.disabled = false;
  }
  buttonRefresh(id) {
    // should be parseInt to get correct result
    return buttonsDom.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
  }
}
//3- storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

//add listener
document.addEventListener("DOMContentLoaded", () => {
  const ui = new Ui();

  const products = new Products();
  const productsData = products.getProducts();
  ui.setupApp();
  //console.log(productsData);
  // get product in cart from localstorage
  ui.displayProducts(productsData);
  ui.getAddToCart();
  ui.cartLogic();
  Storage.saveProducts(productsData);
});
cartClick.addEventListener("click", showCart);
cartBackDrop.addEventListener("click", closeCartFn);
confirmBtn.addEventListener("click", closeCartFn);
menuBar.addEventListener("click", showMenuFn);
closeMenu.addEventListener("click", closeMenuFn);
menuBackDrop.addEventListener("click", closeMenuFn);

//functions
function showCart() {
  cartModal.style.opacity = "1";
  cartModal.style.position = "fixed";
  cartModal.style.top = "20%";
  cartBackDrop.style.display = "flex";
}
function closeCartFn() {
  cartModal.style.opacity = "0";
  cartModal.style.position = "absolute";
  cartModal.style.top = "-100%";
  cartBackDrop.style.display = "none";
}
function showMenuFn() {
  showMenu.style.opacity = "1";
  showMenu.style.position = "fixed";
  showMenu.style.top = "0";
  menuBackDrop.style.display = "flex";
}
function closeMenuFn() {
  showMenu.style.opacity = "0";
  showMenu.style.position = "absolute";
  showMenu.style.top = "-100%";
  menuBackDrop.style.display = "none";
}
