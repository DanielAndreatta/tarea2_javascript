

// Cada producto que vende el super es creado con esta clase
class Producto {
    sku;            // Identificador único del producto
    nombre;         // Su nombre
    categoria;      // Categoría a la que pertenece este producto
    precio;         // Su precio
    stock;          // Cantidad disponible en stock

    constructor(sku, nombre, precio, categoria, stock) {
        this.sku = sku;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;

        // Si no me definen stock, pongo 10 por defecto
        this.stock = stock || 10;
    }
}

// Creo todos los productos que vende mi super
const queso = new Producto('KS944RUR', 'Queso', 10, 'lacteos', 4);
const gaseosa = new Producto('FN312PPE', 'Gaseosa', 5, 'bebidas');
const cerveza = new Producto('PV332MJ', 'Cerveza', 20, 'bebidas');
const arroz = new Producto('XX92LKI', 'Arroz', 7, 'alimentos', 20);
const fideos = new Producto('UI999TY', 'Fideos', 5, 'alimentos');
const lavandina = new Producto('RT324GD', 'Lavandina', 9, 'limpieza');
const shampoo = new Producto('OL883YE', 'Shampoo', 3, 'higiene', 50);
const jabon = new Producto('WE328NJ', 'Jabon', 4, 'higiene', 3);

// Genero un listado de productos. Simulando base de datos
const productosDelSuper = [queso, gaseosa, cerveza, arroz, fideos, lavandina, shampoo, jabon];


// Cada cliente que venga a mi super va a crear un carrito
class Carrito {
    productos;      // Lista de productos agregados
    categorias;     // Lista de las diferentes categorías de los productos en el carrito
    precioTotal;    // Lo que voy a pagar al finalizar mi compra

    // Al crear un carrito, empieza vacío
    constructor() {
        this.precioTotal = 0;
        this.productos = [];
        this.categorias = [];
    }

    /*
        función que agrega @{cantidad} de productos con @{sku} al carrito
    */

    async agregarProducto(sku, cantidad) {
        console.log(`Agregando el producto ${sku} al carrito...`);
    
        try {

            // Busco el producto en la "base de datos"
            const producto = await findProductBySku(sku);
            console.log("Producto encontrado: \n", producto);

            // Verifico si hay cantidad en Stock
            if (producto.stock <= cantidad && cantidad > 0) {
                throw new Error(`La cantidad requerida excede el stock`);
            }
    
            // Verificar si el producto ya está en el carrito
            const productoEnCarrito = this.productos.find(producto => producto.sku === sku);

            if (productoEnCarrito) {

                // Si el producto ya está en el carrito, actualizo la cantidad
                console.log(`Producto repetido ${productoEnCarrito.nombre}`);
                productoEnCarrito.cantidad += cantidad;
                // Resto el stock
                producto.stock -= cantidad;
                // Actualizo el precio total
                this.precioTotal = this.precioTotal + (producto.precio * cantidad);

            } else {

                // Si el producto no está en el carrito, lo agrego como un nuevo producto en el carrito
                const nuevoProducto = new ProductoEnCarrito(sku, producto.nombre, producto.categoria, cantidad);
                this.productos.push(nuevoProducto);
                // Actualizo el precio total
                this.precioTotal = this.precioTotal + (producto.precio * cantidad);
                // Resto el stock
                producto.stock -= cantidad;
                // Verificar si la categoría ya está en la lista de categorías
                const categoriaExistente = this.categorias.find((categoria) => categoria === producto.categoria);

                if (!categoriaExistente) {

                    this.categorias.push(producto.categoria);
                }

            }

            //Llama un metodo para mostrar el carrito
            this.mostrarCarrito();
    
        } catch (error) {
            console.log(`Error al agregar el producto ${sku} al carrito: ${error}`);
        }
    }

    /*
        función que elimina @{cantidad} de productos con @{sku} del carrito
    */

    async eliminarProducto(sku, cantidad) {

        // Busco el producto en la "base de datos"
        const productoBuscado = await findProductBySku(sku);

        return new Promise((resolve, reject) => {
            try {
                console.log(`Eliminando el producto ${sku} del carrito...`);

                // Busco el producto en el carrito
                const productoEnCarrito = this.productos.find(producto => producto.sku === sku);
                if (!productoEnCarrito) {
                    reject(`El producto ${sku} no existe en el carrito.`);
                    return;
                }

                if (cantidad<=0) {
                    reject(`La cantidad ingresada no es correcta (cero o negativa): ${cantidad}`);
                    return;
                }

                // Verificar si la cantidad a eliminar es menor que la cantidad en el carrito
                if (cantidad < productoEnCarrito.cantidad) {

                    // Resto la cantidad indicada al producto en el carrito
                    productoEnCarrito.cantidad -= cantidad;
                    this.precioTotal -= productoBuscado.precio * cantidad;
                    // Devuelvo el Stock
                    productoBuscado.stock += cantidad;
                    resolve(`Se eliminaron ${cantidad} cantidades del producto ${sku} del carrito`);

                } else {

                    // La cantidad a eliminar es mayor o igual a la cantidad en el carrito, se elimina completamente
                    const productoIndex = this.productos.indexOf(productoEnCarrito);
                    const productoEliminado = this.productos.splice(productoIndex, 1)[0];
                    this.precioTotal -= productoBuscado.precio * productoEliminado.cantidad;
                    // Devuelvo el Stock
                    productoBuscado.stock += productoEliminado.cantidad;

                    // Verificar si es necesario eliminar la categoría
                    const productosCategoria = this.productos.filter((producto) => producto.categoria === productoBuscado.categoria);
                    console.log(productosCategoria);
                    if (productosCategoria.length === 0) {
                        const categoriaIndex = this.categorias.indexOf(productoBuscado.categoria);
                        if (categoriaIndex !== -1) {
                            this.categorias.splice(categoriaIndex, 1);
                        }
                    }

                    resolve(`Se eliminó completamente el producto ${sku} del carrito.`);

                }     

            } catch (error) {
                console.log(`Error al eliminar el producto ${sku}: ${error}`);
            }
                
        });
    }

    //Metodo para mostrar el carrito
    mostrarCarrito() {
        console.log('-----------------------------------------------------CARRITO-----------------------------------------------------');
        console.log(this);
        console.log('-----------------------------------------------------------------------------------------------------------------\n');
    }

}

// Cada producto que se agrega al carrito es creado con esta clase
class ProductoEnCarrito {
    sku;       // Identificador único del producto
    nombre;    // Su nombre
    categoria;    // Su categoria
    cantidad;  // Cantidad de este producto en el carrito

    constructor(sku, nombre, categoria, cantidad) {
        this.sku = sku;
        this.nombre = nombre;
        this.categoria = categoria;
        this.cantidad = cantidad;
    }
}

// Función que busca un producto por su sku en "la base de datos"
function findProductBySku(sku) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const foundProduct = productosDelSuper.find(product => product.sku === sku);
            if (foundProduct) {
                resolve(foundProduct);
            } else {
                reject(`Producto ${sku} no encontrado en la base de datos`);
            }
        }, 1500);
    });
}


const carrito = new Carrito();
carrito.agregarProducto('KS944RUR', 1);
carrito.agregarProducto('AAABBB', 4);
carrito.agregarProducto('UI999TY', 3);
carrito.agregarProducto('PV332MJ', 5);
carrito.agregarProducto('OL883YE', 5);
carrito.agregarProducto('FN312PPE', 5)
.then(carrito.eliminarProducto('FN312PPE', 2)
.then((mensaje) => {
    console.log(mensaje);
    carrito.mostrarCarrito();
})
.catch((error) => {
    console.log(error);
}))
.then(carrito.eliminarProducto('KS944RUR', 4)
.then((mensaje) => {
    console.log(mensaje);
    carrito.mostrarCarrito();
})
.catch((error) => {
    console.log(error);
}));

