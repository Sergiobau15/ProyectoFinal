import React, { useState, useEffect } from 'react';
import AdministradorActualizarProducto from './actualizar';
import StoreKeeperLayout from '../../../components/StoreKeeperLayout';
import AdminLayout from '../../../components/AdminLayout';
import Axios from 'axios';
import { Link } from 'react-router-dom';

const AdministradorConsultaProducto = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of products per page
  const [confirmDelete, setConfirmDelete] = useState(false); // Para confirmar la inactivación
  const [productToDelete, setProductToDelete] = useState(null); // Producto a inactivar


  const fetchProducts = async () => {
    try {
      const response = await Axios.get('http://localhost:3002/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    const userSession = sessionStorage.getItem('usuario');
    if (userSession) {
      const sessionData = JSON.parse(userSession);
      setUserRole(sessionData.Rol);
    }
  }, []);

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategoryFilter(selectedCategory);
    setCurrentPage(1); // Reset to the first page
    filterProducts(selectedCategory, minPrice, maxPrice, searchQuery);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    if (name === 'minPrice') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
    filterProducts(categoryFilter, name === 'minPrice' ? value : minPrice, name === 'maxPrice' ? value : maxPrice, searchQuery);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    filterProducts(categoryFilter, minPrice, maxPrice, value);
  };

  const filterProducts = (category, min, max, search) => {
    const filtered = products.filter(product => {
      const withinCategory = category ? product.categoria === category : true;
      const withinPriceRange = (min === '' || product.precio >= parseFloat(min)) &&
        (max === '' || product.precio <= parseFloat(max));
      const matchesSearch = product.nombre.toLowerCase().includes(search.toLowerCase());
      return withinCategory && withinPriceRange && matchesSearch;
    });
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleProductUpdate = async () => {
    await fetchProducts();
  };


  const openUpdateForm = (productId) => {
    setSelectedProductId(productId);
    setIsUpdateFormOpen(true);
  };

  const closeUpdateForm = () => {
    setIsUpdateFormOpen(false);
    setSelectedProductId(null);
  };

   // Llamar a la API para inactivar el producto
   const handleProductDelete = async () => {
    try {
      await Axios.patch(`http://localhost:3002/products/inactivateProduct/${productToDelete}`);
      await fetchProducts(); // Refresca la lista de productos después de inactivarlo
      setConfirmDelete(false); // Cierra la confirmación
      setProductToDelete(null); // Limpia el producto seleccionado
    } catch (error) {
      console.error('Error inactivating product:', error);
    }
  };


  // Calcular productos por pagina
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Paginacion
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const renderProductContent = () => (
    <div className="flex flex-col h-full bg-gray-100">
      <main className="flex-grow p-4 overflow-y-auto">
        <center>
          <h1 className="text-3xl mb-6 p-6 bg-gray-700 text-white font-bold rounded-lg shadow-md">
            Nuestros productos
          </h1>
        </center>

        <div className="mb-4 text-center flex justify-center items-center">
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="p-2 border border-gray-300 rounded-md text-gray-700 mr-2"
          >
            <option value="">Todos los productos</option>
            <option value="Herramientas manuales">Herramientas manuales</option>
            <option value="Materiales de construccion">Materiales de construcción</option>
            <option value="Iluminacion y electricidad">Iluminacion y Electricidad</option>
            <option value="Jardineria y exteriores">Jardinería y exteriores</option>
            <option value="Pinturas">Pinturas</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre del producto"
            className="p-2 border border-gray-300 rounded-md w-1/4 mr-2"
          />

          <label className="mr-2">Precio mínimo:</label>
          <input
            type="number"
            name="minPrice"
            value={minPrice}
            onChange={handlePriceChange}
            className="p-2 border border-gray-300 rounded-md w-1/4 mr-2"
            placeholder="Min"
          />

          <label className="mr-2">Precio máximo:</label>
          <input
            type="number"
            name="maxPrice"
            value={maxPrice}
            onChange={handlePriceChange}
            className="p-2 border border-gray-300 rounded-md w-1/4"
            placeholder="Max"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {currentProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-lg flex flex-col justify-between min-h-[400px]">
              <div className="relative w-full h-32 bg-gray-200 rounded overflow-hidden">
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col flex-grow">
                <h2 className="text-xl font-semibold mb-2 break-words">{product.nombre}</h2>
                <p className="text-gray-700 mb-2">Stock: {product.cantidad}</p>
                <p className="text-gray-700 mb-2">Precio: ${product.precio}</p>
                <p className="text-gray-700 mb-4 flex-grow break-words">{product.descripcion}</p>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => openUpdateForm(product.id)}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-300 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setConfirmDelete(true);
                    setProductToDelete(product.id);
                  }}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-300 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Confirmación de eliminación */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
              <p className="mb-6">¿Estás seguro de que deseas inactivar este producto?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProductDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                  Inactivar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-400 transition"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-400 transition ml-2"
            >
              Siguiente
            </button>
          </div>

          <div className="text-sm text-gray-700 ml-4">
            Página {currentPage} de {totalPages}
          </div>

          <Link
            to="/productosInactivos"
            className="bg-green-700 text-white p-2 rounded hover:bg-green-500 transition"
          >
            Productos Inactivos
          </Link>
          </div>


        {isUpdateFormOpen && (
          <AdministradorActualizarProducto
            productId={selectedProductId}
            onClose={() => {
              closeUpdateForm();
              handleProductUpdate();
            }}
          />
        )}

      </main>
    </div>
  );

  const renderLayout = () => {
    if (userRole === 'Administrador') {
      return <AdminLayout>{renderProductContent()}</AdminLayout>;
    } else if (userRole === 'Almacenista') {
      return <StoreKeeperLayout>{renderProductContent()}</StoreKeeperLayout>;
    }
    return null;
  };

  return <>{renderLayout()}</>;
};

export default AdministradorConsultaProducto;