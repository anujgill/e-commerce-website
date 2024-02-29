// document.addEventListener('DOMContentLoaded', function () {
    var user = JSON.parse(sessionStorage.getItem('userDetails'));
    var admin = document.getElementById('admin');
    var welcome = document.getElementById('welcome');
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const cartButton = document.getElementById('cartButton');
    const showMoreButton = document.getElementById('showMoreButton');
    const productsPerPage = 5;
    let currentDisplayCount = productsPerPage;
    const logout = document.getElementById('logout');
    if (!user) {
        welcome.innerHTML = "Welcome user";
        admin.style.display = 'none';
        cartButton.style.display = 'block';
        cartButton.addEventListener('click', () => {
            alert("pls login");
        });
        cartButton.style.opacity = 0.5; 
        
        logout.innerText = "Login";
    } else {
        welcome.innerHTML = `Welcome ${user.name}`;
        if (user.role === 'Admin') {
            const showMoreButton = document.getElementById('showMoreButton');
            admin.style.display = 'block';
            cartButton.style.display = 'none';
        } else {
            admin.style.display = 'none';
            cartButton.style.display = 'block';
        }
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const pTable = document.getElementById('pTable');
    displayProducts();

    function addProducts() {
        const pname = document.getElementById('pname').value;
        const pdesc = document.getElementById('pdesc').value;
        const pprice = document.getElementById('pprice').value;
        const pquantity = document.getElementById('pquantity').value;

        if (pname == '' || pdesc == '' || pprice == '' || pquantity == '') {
            alert("Enter details!!");
            return;
        }

        const productId = uuidv4();

        const product = {
            productId: productId,
            name: pname,
            desc: pdesc,
            price: pprice,
            quantity: pquantity
        };

        products.push(product);
        saveLocalStorage();
        displayProducts();
        document.getElementById('pname').value = '';
        document.getElementById('pdesc').value = '';
        document.getElementById('pprice').value = '';
        document.getElementById('pquantity').value = '';
    }

    function deleteProduct(index) {
        const proId = products[index].productId;
        products.splice(index, 1);
        for(const userC in cart){
            const ind = cart[userC].findIndex(pro=>{
                pro.productId===proId;
            });
            if(ind != -1){
                cart[userC].splice(ind,1);
            }
        };
        localStorage.setItem('cart', JSON.stringify(cart));
        saveLocalStorage();
        if (products.length > 0) {
            pTable.style.display = 'table';
            displayProducts();
        } else {
            pTable.style.display = 'none';
        }
    }

    function updateProduct(index) {
        const updateModal = document.getElementById('updateModal');
        const updatedNameInput = document.getElementById('updatedName');
        const updatedDescInput = document.getElementById('updatedDesc');
        const updatedPriceInput = document.getElementById('updatedPrice');
        const updatedQuantityInput = document.getElementById('updatedQuantity');

        updatedNameInput.value = products[index].name;
        updatedDescInput.value = products[index].desc;
        updatedPriceInput.value = products[index].price;
        updatedQuantityInput.value = products[index].quantity;

        updateModal.style.display = 'block';

        updateModal.setAttribute('data-index', index);
    }

    function updateP() {
        const updateModal = document.getElementById('updateModal');
        const updatedNameInput = document.getElementById('updatedName');
        const updatedDescInput = document.getElementById('updatedDesc');
        const updatedPriceInput = document.getElementById('updatedPrice');
        const updatedQuantityInput = document.getElementById('updatedQuantity');

        const index = updateModal.getAttribute('data-index');

        //const productId = uuidv4();
        
        const pId = products[index].productId;

        products[index] = {
            productId: pId,
            name: updatedNameInput.value,
            desc: updatedDescInput.value,
            price: updatedPriceInput.value,
            quantity: updatedQuantityInput.value
        };

        // Update the product in the carts of all users
        for (const userKey in cart) {
            const userCart = cart[userKey];
            // console.log(userCart)
            const cartProductIndex = userCart.findIndex((pro) => pro.productId === pId);
            if (cartProductIndex !== -1) {
                userCart[cartProductIndex].name = products[index].name;
                userCart[cartProductIndex].desc = products[index].desc;
                userCart[cartProductIndex].price = products[index].price;
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        saveLocalStorage();
        displayProducts();

        closeUpdateModal();
    }

    function goToCart() {
        if (!user) {
            cartButton.addEventListener('click', () => {
                alert("pls login");
            });
            return;
        }
        window.location.href = 'cart.html';
    }

    function closeUpdateModal() {
        const updateModal = document.getElementById('updateModal');
        updateModal.style.display = 'none';
    }

    function showMoreProducts() {
        currentDisplayCount += productsPerPage;
        displayProducts();
    }

    function displayProductRows(productsToDisplay) {
        const pTableBody = document.getElementById('pTableBody');
        productsToDisplay.forEach((product, index) => {
            const row = document.createElement('tr');

            if (user && user.role === 'Admin') {
                const updatePro = `<button id="update" onclick="updateProduct(${index})">Update</button>`;
                const deletePro = `<button id="delete" onclick="deleteProduct(${index})">Delete</button>`;
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.desc}</td>
                    <td>${product.price}</td>
                    <td>${product.quantity}</td>
                    <td>${updatePro}${deletePro}</td>
                `;
            } else {
                const addCart = `<button class="addCart" onclick="addToCart(${index})">Add to cart</button>`;
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.desc}</td>
                    <td>Rs.${product.price}</td>
                    <td>${product.quantity}</td>
                    <td>${addCart}</td>
                `;
            }
            pTableBody.appendChild(row);
        });
    }

    function displayProducts() {
        const pTableBody = document.getElementById('pTableBody');
        pTableBody.innerHTML = '';
        const displayedProducts = products.slice(0, currentDisplayCount);
        displayProductRows(displayedProducts);

        if (currentDisplayCount < products.length) {
            showMoreButton.style.display = 'block';
        } else {
            showMoreButton.style.display = 'none';
        }
    }

    function addToCart(index){
        if (!user) {
            const addCartButtons = document.getElementsByClassName('addCart');
            for (const button of addCartButtons) {
                button.style.opacity = 0.5;
                button.addEventListener('click', () => {
                    alert("Please log in");
                });
            }
        
            return;
        }
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const userCart = cart[user.name] || [];
        var productExists = userCart.find((pro)=>{
            return (pro.productId === products[index].productId);
        });
        
        if(productExists){
            if(productExists.quantity+1>products[index].quantity){
                alert("stock out");
                return;
            }
            else{
                productExists.quantity++;
            }
        }
        else{
            var cartProduct = {
                name:products[index].name,
                desc : products[index].desc,
                price: products[index].price,
                productId:products[index].productId,
                quantity : 1
            }
            userCart.push(cartProduct);
        }
        // console.log(userCart);
        cart[user.name] = userCart;
        console.log(cart)
        localStorage.setItem('cart',JSON.stringify(cart));

    }

    function saveLocalStorage() {
        localStorage.setItem('products', JSON.stringify(products));
    }

    if (products.length > 0) {
        pTable.style.display = 'table';
    } else {
        pTable.style.display = 'none';
    }

    function logOut() {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
// });
