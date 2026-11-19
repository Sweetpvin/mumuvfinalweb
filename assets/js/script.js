/* =====================================================
   1. IMPORTACIONES
===================================================== */

// Las rutas "three" y "three/addons/" se resuelven con el importmap de index.html
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


/* =====================================================
   2. CARRUSEL DE IMÁGENES
===================================================== */

const track = document.querySelector(".carousel-track");
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");

const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let currentIndex = 0;

function updateCarousel() {

    if (!track || slides.length === 0) return;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
    });

    slides.forEach((slide, index) => {
        slide.classList.toggle("active", index === currentIndex);
    });

}

// Botón siguiente
if (nextBtn) {

    nextBtn.addEventListener("click", () => {

        currentIndex++;

        if (currentIndex >= slides.length) {
            currentIndex = 0;
        }

        updateCarousel();

    });

}

// Botón anterior
if (prevBtn) {

    prevBtn.addEventListener("click", () => {

        currentIndex--;

        if (currentIndex < 0) {
            currentIndex = slides.length - 1;
        }

        updateCarousel();

    });

}

// Indicadores del carrusel
dots.forEach((dot, index) => {

    dot.addEventListener("click", () => {

        currentIndex = index;

        updateCarousel();

    });

});

// Mostrar la primera diapositiva
updateCarousel();

// Avance automático cada 5 segundos (se pausa al pasar el mouse o tocar)
const carrusel = document.querySelector(".carousel-container");
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let autoplay = null;

function iniciarAutoplay() {

    if (sinMovimiento || slides.length < 2) return;

    detenerAutoplay();

    autoplay = setInterval(() => {

        currentIndex = (currentIndex + 1) % slides.length;

        updateCarousel();

    }, 5000);

}

function detenerAutoplay() {

    clearInterval(autoplay);

}

if (carrusel) {

    carrusel.addEventListener("mouseenter", detenerAutoplay);
    carrusel.addEventListener("mouseleave", iniciarAutoplay);
    carrusel.addEventListener("focusin", detenerAutoplay);
    carrusel.addEventListener("focusout", iniciarAutoplay);

    // Deslizar con el dedo en celulares
    let inicioX = null;

    carrusel.addEventListener("touchstart", event => {

        inicioX = event.touches[0].clientX;
        detenerAutoplay();

    }, { passive: true });

    carrusel.addEventListener("touchend", event => {

        if (inicioX === null) return;

        const distancia = event.changedTouches[0].clientX - inicioX;

        if (Math.abs(distancia) > 40) {

            currentIndex = (currentIndex + (distancia < 0 ? 1 : -1) + slides.length) % slides.length;

            updateCarousel();

        }

        inicioX = null;
        iniciarAutoplay();

    });

    iniciarAutoplay();

}


/* =====================================================
   3. CONTENIDO DINÁMICO
===================================================== */

window.mostrarContenido = function(tipo) {

    const contenedor = document.getElementById("contenido-dinamico");

    if (!contenedor) {
        console.error("No se encontró #contenido-dinamico");
        return;
    }

    const contenidos = {

        Reel_informativo: `
            <iframe
                src="https://www.youtube.com/embed/DuWoA69TP-4"
                title="Reel informativo"
                allowfullscreen>
            </iframe>
        `,

        teaser: `
            <iframe
                src="https://www.youtube.com/embed/k-nc-GfDLEI"
                title="Teaser"
                allowfullscreen>
            </iframe>
        `,

        fuentes: `
            <iframe
                src="https://www.instagram.com/reel/DePg7EfMjWm/embed"
                title="Influencer"
                allowfullscreen>
            </iframe>
        `

    };

    contenedor.innerHTML = contenidos[tipo] || `
        <p>Contenido no disponible</p>
    `;

    // Marcar el botón elegido
    document.querySelectorAll(".media-item").forEach(boton => {

        boton.classList.toggle("activo", boton.dataset.contenido === tipo);

    });

};

document.querySelectorAll("[data-contenido]").forEach(boton => {

    boton.addEventListener("click", () => {

        window.mostrarContenido(boton.dataset.contenido);

    });

});


/* =====================================================
   4. GALERÍA 3D - PUEBLO MUMU
===================================================== */

// ELEMENTOS HTML

const panels = document.querySelectorAll(".mojojoy-panel");

const modal = document.getElementById("mojojoy-modal");

const closeModal = document.getElementById("close-modal");

const contenedor3D = document.getElementById("modelo_mojojoy");

const avisoCarga = document.getElementById("modal-loader");

function mostrarAviso(texto) {

    if (!avisoCarga) return;

    avisoCarga.textContent = texto;
    avisoCarga.hidden = false;

}

function ocultarAviso() {

    if (avisoCarga) avisoCarga.hidden = true;

}


/* =====================================================
   5. RUTAS DE LOS MODELOS
===================================================== */

const modelos3D = {

    modelo1: "modelos/hui/huitoto_ps1.glb",

    modelo2: "modelos/mojo/mojojoy.glb",

    modelo3: "modelos/mangu/manguare_ps1.glb"

};


/* =====================================================
   6. VARIABLES THREE.JS
===================================================== */

let scene = null;

let camera = null;

let renderer = null;

let controls = null;

let modeloActual = null;

let animacionIniciada = false;


/* =====================================================
   7. INICIALIZAR VISOR 3D
===================================================== */

function iniciarVisor3D() {

    if (!contenedor3D) {

        console.error("No existe el contenedor #modelo_mojojoy");

        return;

    }

    // Evitar inicializaciones duplicadas
    if (renderer) return;

    const width = contenedor3D.clientWidth || 600;

    const height = contenedor3D.clientHeight || 450;


    // ESCENA

    scene = new THREE.Scene();


    // CÁMARA

    camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        0.01,
        1000
    );

    camera.position.set(0, 1, 5);


    // RENDERIZADOR

    renderer = new THREE.WebGLRenderer({

        alpha: true,

        antialias: true

    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(width, height);

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    contenedor3D.appendChild(renderer.domElement);


    // ILUMINACIÓN AMBIENTAL

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        2
    );

    scene.add(ambientLight);


    // LUZ PRINCIPAL

    const directionalLight = new THREE.DirectionalLight(
        0xffffff,
        3
    );

    directionalLight.position.set(4, 5, 5);

    scene.add(directionalLight);


    // LUZ DE RELLENO

    const fillLight = new THREE.DirectionalLight(
        0xffffff,
        1.5
    );

    fillLight.position.set(-4, 2, -3);

    scene.add(fillLight);


    // CONTROLES DEL MOUSE

    controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;

    controls.dampingFactor = 0.05;

    controls.enableZoom = true;

    controls.enableRotate = true;

    controls.enablePan = false;


    // INICIAR ANIMACIÓN

    if (!animacionIniciada) {

        animacionIniciada = true;

        animarVisor3D();

    }

}


/* =====================================================
   8. CARGAR MODELO GLB
===================================================== */

function cargarModelo3D(nombre) {

    const ruta = modelos3D[nombre];

    if (!ruta) {

        console.error("No existe una ruta para este modelo:", nombre);

        return;

    }

    iniciarVisor3D();

    if (!renderer) return;


    // ELIMINAR MODELO ANTERIOR

    if (modeloActual) {

        scene.remove(modeloActual);

        modeloActual = null;

    }


    // CARGADOR GLB

    const loader = new GLTFLoader();

    console.log("Cargando modelo:", ruta);


    mostrarAviso("Cargando modelo…");

    loader.load(

        ruta,

        function(gltf) {

            modeloActual = gltf.scene;


            // CALCULAR DIMENSIONES

            const box = new THREE.Box3().setFromObject(
                modeloActual
            );

            const center = box.getCenter(
                new THREE.Vector3()
            );

            const size = box.getSize(
                new THREE.Vector3()
            );


            // CENTRAR MODELO

            modeloActual.position.sub(center);


            // AJUSTAR ESCALA

            const maxDimension = Math.max(
                size.x,
                size.y,
                size.z
            );

            if (maxDimension > 0) {

                const escala = 2.5 / maxDimension;

                modeloActual.scale.multiplyScalar(escala);

            }


            // AGREGAR MODELO A LA ESCENA

            scene.add(modeloActual);


            // AJUSTAR CÁMARA

            const esfera = new THREE.Sphere();

            new THREE.Box3()
                .setFromObject(modeloActual)
                .getBoundingSphere(esfera);

            const radio = Math.max(esfera.radius, 0.1);

            // Usar el ángulo más estrecho (vertical u horizontal)
            // para que el modelo entre también en pantallas verticales
            const fovVertical = THREE.MathUtils.degToRad(camera.fov);
            const fovHorizontal = 2 * Math.atan(Math.tan(fovVertical / 2) * camera.aspect);
            const fovUtil = Math.min(fovVertical, fovHorizontal);

            const distancia = radio /
                Math.sin(fovUtil / 2) * 0.7;


            camera.position.set(
                distancia * 0.8,
                distancia * 0.5,
                distancia * 1.5
            );

            camera.near = Math.max(radio / 100, 0.001);

            camera.far = distancia * 10;

            camera.updateProjectionMatrix();


            // CONFIGURAR CONTROLES

            controls.target.set(0, 0, 0);

            controls.minDistance = radio * 0.5;

            controls.maxDistance = radio * 8;

            controls.update();


            ocultarAviso();

            console.log(
                "Modelo cargado correctamente:",
                nombre
            );

        },


        // PROGRESO DE CARGA

        function(xhr) {

            if (xhr.total > 0) {

                const porcentaje = Math.round(
                    xhr.loaded / xhr.total * 100
                );

                console.log("Carga:", porcentaje + "%");

            }

        },


        // ERROR DE CARGA

        function(error) {

            mostrarAviso("No se pudo cargar el modelo");

            console.error(
                "Error cargando el modelo:",
                ruta,
                error
            );

        }

    );

}


/* =====================================================
   9. ANIMACIÓN DEL VISOR
===================================================== */

function animarVisor3D() {

    requestAnimationFrame(animarVisor3D);

    if (!renderer || !scene || !camera) return;

    if (controls) {

        controls.update();

    }

    renderer.render(scene, camera);

}


/* =====================================================
   10. REDIMENSIONAR VISOR
===================================================== */

function ajustarVisor3D() {

    if (!renderer || !camera || !contenedor3D) return;

    const width = contenedor3D.clientWidth;

    const height = contenedor3D.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

}


/* =====================================================
   11. SELECCIÓN DE MODELOS
===================================================== */

panels.forEach(panel => {

    panel.addEventListener("click", () => {


        // QUITAR SELECCIÓN ANTERIOR

        panels.forEach(item => {

            item.classList.remove("active");

        });


        // ACTIVAR PANEL SELECCIONADO

        panel.classList.add("active");


        // IDENTIFICAR MODELO

        const nombreModelo = panel.dataset.model;


        // COMPROBAR QUE EXISTA LA RUTA

        if (!modelos3D[nombreModelo]) {

            console.error(
                "No hay una ruta configurada para:",
                nombreModelo
            );

            return;

        }


        // ABRIR MODAL

        if (modal) {

            modal.classList.add("active");

        } else {

            console.error("No se encontró el modal 3D");

            return;

        }


        // ESPERAR A QUE EL MODAL SEA VISIBLE

        requestAnimationFrame(() => {

            iniciarVisor3D();

            ajustarVisor3D();

            cargarModelo3D(nombreModelo);

        });

    });

});


/* =====================================================
   12. CERRAR MODAL
===================================================== */

if (closeModal && modal) {

    closeModal.addEventListener("click", () => {

        modal.classList.remove("active");

    });

}


// CERRAR CON TECLA ESCAPE

document.addEventListener("keydown", event => {

    if (event.key === "Escape" && modal) {

        modal.classList.remove("active");

    }

});


/* =====================================================
   13. DETECTAR CAMBIOS DE TAMAÑO
===================================================== */

window.addEventListener("resize", ajustarVisor3D);


/* =====================================================
   14. INICIAR PÁGINA
===================================================== */

// MENÚ MÓVIL (botón ☰)

function configurarMenu() {

    const boton = document.querySelector(".menu-toggle");

    const nav = document.getElementById("main-nav");

    if (!boton || !nav) return;

    boton.addEventListener("click", () => {

        const abierto = nav.classList.toggle("open");

        boton.setAttribute("aria-expanded", String(abierto));

    });

    // Cerrar el menú al elegir una sección
    nav.querySelectorAll("a").forEach(enlace => {

        enlace.addEventListener("click", () => {

            nav.classList.remove("open");

            boton.setAttribute("aria-expanded", "false");

        });

    });

}

// APARICIÓN DE ELEMENTOS AL HACER SCROLL

function configurarAnimacionesEntrada() {

    // [selector, tipo de animación, escalonar hermanos]
    const grupos = [
        [".section-index", "", false],
        [".intro-grid > *", "", true],
        [".territory-visual", "zoom", false],
        [".mojojoy-copy > *", "izquierda", true],
        [".explora-head", "", false],
        [".mojojoy-panel", "", true],
        [".message-content > *", "", true],
        [".media-item", "izquierda", true],
        [".message-art", "derecha", false],
        [".sources-grid > div", "", true],
        [".sources-grid > h2", "", false],
        [".source-card", "zoom", true],
        [".footer-grid > *", "", true]
    ];

    const elementos = [];

    grupos.forEach(([selector, tipo, escalonar]) => {

        document.querySelectorAll(selector).forEach((elemento, indice) => {

            if (elemento.hasAttribute("data-reveal")) return;

            elemento.setAttribute("data-reveal", tipo);

            if (escalonar) {

                elemento.style.setProperty("--retraso", `${Math.min(indice, 6) * 0.12}s`);

            }

            elementos.push(elemento);

        });

    });

    // Sin soporte o con movimiento reducido: mostrar todo
    if (!("IntersectionObserver" in window) || sinMovimiento) {

        elementos.forEach(elemento => elemento.classList.add("is-visible"));

        return;

    }

    const observador = new IntersectionObserver(entradas => {

        entradas.forEach(entrada => {

            if (!entrada.isIntersecting) return;

            const elemento = entrada.target;

            elemento.classList.add("is-visible");

            observador.unobserve(elemento);

            // Al terminar, devolver el elemento a sus estilos normales
            // para que sus efectos hover sigan funcionando
            setTimeout(() => {

                elemento.removeAttribute("data-reveal");
                elemento.style.removeProperty("--retraso");

            }, 1800);

        });

    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    elementos.forEach(elemento => observador.observe(elemento));

}


// PROGRESO DE LECTURA, ENCABEZADO Y BOTÓN "ARRIBA"

function configurarScroll() {

    const barra = document.querySelector(".scroll-progress");
    const encabezado = document.querySelector(".site-header");
    const botonArriba = document.querySelector(".to-top");

    let pendiente = false;

    function actualizar() {

        const alto = document.documentElement.scrollHeight - window.innerHeight;
        const progreso = alto > 0 ? window.scrollY / alto : 0;

        if (barra) barra.style.setProperty("--progreso", progreso.toFixed(4));

        if (encabezado) encabezado.classList.toggle("scrolled", window.scrollY > 40);

        if (botonArriba) botonArriba.classList.toggle("show", window.scrollY > 700);

        pendiente = false;

    }

    window.addEventListener("scroll", () => {

        if (!pendiente) {

            pendiente = true;
            requestAnimationFrame(actualizar);

        }

    }, { passive: true });

    actualizar();

}


// RESALTAR LA SECCIÓN ACTUAL EN EL MENÚ

function configurarMenuActivo() {

    const enlaces = [...document.querySelectorAll(".main-nav a")];

    const secciones = enlaces
        .map(enlace => document.querySelector(enlace.getAttribute("href")))
        .filter(Boolean);

    if (!("IntersectionObserver" in window) || secciones.length === 0) return;

    const observador = new IntersectionObserver(entradas => {

        entradas.forEach(entrada => {

            if (!entrada.isIntersecting) return;

            const id = "#" + entrada.target.id;

            enlaces.forEach(enlace => {

                enlace.classList.toggle("active", enlace.getAttribute("href") === id);

            });

        });

    }, { rootMargin: "-45% 0px -50% 0px" });

    secciones.forEach(seccion => observador.observe(seccion));

}

function iniciarPagina() {

    configurarMenu();

    configurarAnimacionesEntrada();

    configurarScroll();

    configurarMenuActivo();

}


// EJECUTAR CUANDO EL HTML ESTÉ DISPONIBLE

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarPagina
    );

} else {

    iniciarPagina();

}
