
/* 
    Author     : Karol Fonseca Arguedas
*/

/*Controller de Ordenes*/
function ControllerOrdenes(name) {

    /*Atributos Públicos*/
    this.name = name;
    
    /*Métodos Públicos*/
    this.executeCargarOrdenes = function () {
        return cargarOrdenes();
    };
    this.executeProcesarCambioEstado = function (idDestino, idOrigen, idOrden) {
        return procesarCambioEstado(idDestino, idOrigen, idOrden);
    };
    this.executeMostrarModal1 = function (itemOrdenId) {
        return mostrarModal1(itemOrdenId);
    };
    this.executeMostrarModal2 = function (itemOrdenId) {
        return mostrarModal2(itemOrdenId);
    };
    this.executeProcesarCambioEstado = function (idDestino, idOrigen, idOrden) {
        return procesarCambioEstado(idDestino, idOrigen, idOrden);
    };
    
    this.executeValidarCambioEstado = function () {
        return validarCambioEstado();
    };

    /*Atributos Privados*/
    const STATE_ORDEN = ['pending', 'working', 'finished', 'delivered', 'complete'];
    var arrayProductos = [];
    var arrayOrdenes = [];
    var ultimoCambio = 0;

    /*Métodos Privados*/
    
    function validarCambioEstado() {
        var requestData = '';
        $.ajax({
            url: 'https://iitd7euw75.execute-api.us-east-1.amazonaws.com/services/products/getProducts',
            type: 'get',
            data: {q: requestData},
            dataType: 'json',
            success: function (response) {
                arrayProductos = response.items;
                var requestData = '';
                $.ajax({
                    url: 'https://iitd7euw75.execute-api.us-east-1.amazonaws.com/services/orders/getOrders',
                    type: 'get',
                    data: {q: requestData},
                    dataType: 'json',
                    success: function (response) {
                        arrayOrdenes = response.items;
                        compararCambioEstado(response.items);
                    },
                    error: function (err) {
                        alert(err);
                    }
                });
            },
            error: function (err) {
                alert(err);
            }
        });
    }
    
    function compararCambioEstado(items) {
        var resp = '';
        for (var i = 0; i < items.length; i++) {
            var itemOrden = items[i];
            if (itemOrden.updatedAt > ultimoCambio) {
                arrayOrdenes = items;
                definirColumnasOrdenes(items);
                i = items.length;
            }
        }
        return resp;
    }
    
    /*Funcionalidad para Control de Ordenes*/
    function cargarOrdenes() {
        var requestData = '';
        $.ajax({
            url: 'https://iitd7euw75.execute-api.us-east-1.amazonaws.com/services/products/getProducts',
            type: 'get',
            data: {q: requestData},
            dataType: 'json',
            success: function (response) {
                arrayProductos = response.items;
                var requestData = '';
                $.ajax({
                    url: 'https://iitd7euw75.execute-api.us-east-1.amazonaws.com/services/orders/getOrders',
                    type: 'get',
                    data: {q: requestData},
                    dataType: 'json',
                    success: function (response) {
                        arrayOrdenes = response.items;
                        definirColumnasOrdenes(response.items);
                    },
                    error: function (err) {
                        alert(err);
                    }
                });
            },
            error: function (err) {
                alert(err);
            }
        });
    }

    function definirColumnasOrdenes(items) {
        for (var i = 0; i < STATE_ORDEN.length - 1; i++) {
            var divHtml = definirColumnaOrden(items, STATE_ORDEN[i]);
            $("#sortable" + (i + 1)).html('');
            $("#sortable" + (i + 1)).html(divHtml);
        }
    }

    function definirColumnaOrden(items, statusCol) {
        var resp = '';
        for (var i = 0; i < items.length; i++) {
            var itemOrden = items[i];
            if (itemOrden.state === statusCol) {
                resp += definirFilaOrden(itemOrden);
            }
            if (itemOrden.updatedAt > ultimoCambio) {
                ultimoCambio = itemOrden.updatedAt;
            }
        }
        return resp;
    }

    function definirFilaOrden(itemOrden) {
        var resp = '<li class="ui-element" id="' + itemOrden.id;
        if (itemOrden.state === STATE_ORDEN[3]) {
            resp += '" ondblclick="executeMostrarModal2(' + "'" + itemOrden.id + "'" + ')">';
        } else {
            resp += '" ondblclick="executeMostrarModal1(' + "'" + itemOrden.id + "'" + ')">';
        }
        resp += '<div class="row">' +
                '<div class="col-sm-6 id-orden">' + itemOrden.id + '</div>' +
                '<div class="col-sm-6 id-usuario">' + itemOrden.user + '</div>' +
                '</div><div class="row"><div class="col-sm-12 productos">';
        resp += definirFilaOrdenProdutos(itemOrden.items);
        resp += '</div></div></li>';
        return resp;
    }

    function definirFilaOrdenProdutos(itemsOrdenProductos) {
        var resp = '';
        if (itemsOrdenProductos !== undefined) {
            for (var i = 0; i < itemsOrdenProductos.length; i++) {
                var itemOrdenProducto = itemsOrdenProductos[i];
                var itemProducto = obtenerProduto(itemOrdenProducto.id);
                if (itemProducto !== undefined) {
                    resp += definirFilaProduto(itemProducto, itemOrdenProducto.qty);
                    if (i !== itemsOrdenProductos.length - 1) {
                        resp += ', ';
                    }
                } else {
                    resp += '<span class="productos-cantidad">' + itemOrdenProducto.qty + '</span> ' +
                            '<span class="productos-nombre">Producto sin definir</span>';
                }
            }
        } else {
            resp += '<span class="productos-cantidad">Productos sin definir</span>';
        }
        return resp;
    }

    function definirFilaProduto(itemProducto, cantidad) {
        var resp =
                '<span class="productos-cantidad">' + cantidad + '</span> ' +
                '<span class="productos-nombre">' + itemProducto.name + '</span> ';
        return resp;
    }

    function obtenerProduto(idProducto) {
        var itemProducto;
        for (var i = 0; i < arrayProductos.length; i++) {
            var tempProducto = arrayProductos[i];
            if (tempProducto.id === idProducto) {
                itemProducto = tempProducto;
            }
        }
        return itemProducto;
    }

    function procesarCambioEstado(idDestino, idOrigen, idOrden) {
        var idColumDestino = idDestino.substr(8, 8);
        var numColmDestino = Number(idColumDestino);
        var idColumOrigen = idOrigen.substr(8, 8);
        var numColmOrigen = Number(idColumOrigen);
        if(numColmOrigen===numColmDestino-1 || numColmOrigen-1===numColmDestino){ // en caso de no querer reversar el proceso : numColmDestino>numColmOrigen
            actualizarEstado(idOrden, STATE_ORDEN[numColmDestino - 1]);
        } else {
            alert("Una orden no se puede saltar pasos en el proceso");
            cargarOrdenes();
        }
    }

    function actualizarEstado(idOrden, idState) {
        var id = idOrden;
        var state = idState;
        var requestData = {
            id: id,
            state: state
        };
        $.ajax({
            url: 'https://iitd7euw75.execute-api.us-east-1.amazonaws.com/services/orders/updateOrder',
            type: 'POST',
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            success: function (e) {
                cargarOrdenes();
            },
            error: function (err) {
                console.log(err);
            },
            headers: {
                "content-type": "application/json"
            },
            beforeSend: function () {
                console.log("Waiting...");
            }
        });
    }

    
    /*Funcionalidad para Modal 1*/
    function mostrarModal1(itemOrdenId) {
        for (var i = 0; i < arrayOrdenes.length; i++) {
            var itemOrden = arrayOrdenes[i];
            if (itemOrden.id === itemOrdenId) {
                $("#idOrden1").html(itemOrden.id);
                $("#idUsuario1").html(itemOrden.user);
                var resp = definirFilaOrdenProdutosModal1(itemOrden.items);
                $("#modalBody1").html(resp);
            }
        }
        $("#staticBackdrop1").modal("show");
    }

    function definirFilaOrdenProdutosModal1(itemsOrdenProductos) {
        var resp = '';
        if (itemsOrdenProductos !== undefined) {
            for (var i = 0; i < itemsOrdenProductos.length; i++) {
                var itemOrdenProducto = itemsOrdenProductos[i];
                var itemProducto = obtenerProduto(itemOrdenProducto.id);
                if (itemProducto !== undefined) {
                    resp += definirFilaProdutoModal1(itemProducto, itemOrdenProducto.qty);
                } else {
                    resp += '<span class="productos-cantidad">' + itemOrdenProducto.qty + '</span> ' +
                            '<span class="productos-nombre">Producto sin definir</span>';
                }
            }
        } else {
            resp += '<span class="productos-cantidad">Productos sin definir</span>';
        }
        return resp;
    }

    function definirFilaProdutoModal1(itemProducto, cantidad) {
        var resp =
                '<div class="row"><div class="col-sm-4">' +
                '<img src="' + itemProducto.image + '" alt=""/>' +
                '</div><div class="col-sm-8">' +
                '<span>' + cantidad + ' - ' + itemProducto.name + '<br></span>' +
                '<span>' + itemProducto.description + '.</span>' +
                '</div></div>';
        return resp;
    }
    
    
    /*Funcionalidad para Modal 2*/
    function mostrarModal2(itemOrdenId) {
        for (var i = 0; i < arrayOrdenes.length; i++) {
            var itemOrden = arrayOrdenes[i];
            if (itemOrden.id === itemOrdenId) {
                $("#idOrden2").html(itemOrden.id);
                $("#idUsuario2").html(itemOrden.user);
                var resp = definirFilaOrdenProdutosModal2(itemOrden.items);
                $("#modalBody2").html(resp);
                $("#btnPagar").click(function () {
                    actualizarEstado(itemOrdenId, STATE_ORDEN[4]);
                    $("#staticBackdrop2").modal("hide");
                });
            }
        }
        $("#staticBackdrop2").modal("show");
    }

    function definirFilaOrdenProdutosModal2(itemsOrdenProductos) {
        var resp = '';
        var total = 0;
        if (itemsOrdenProductos !== undefined) {
            for (var i = 0; i < itemsOrdenProductos.length; i++) {
                var itemOrdenProducto = itemsOrdenProductos[i];
                var itemProducto = obtenerProduto(itemOrdenProducto.id);
                if (itemProducto !== undefined) {
                    resp += definirFilaProdutoModal2(itemProducto, itemOrdenProducto.qty);
                    total += itemProducto.price * itemOrdenProducto.qty;
                } else {
                    resp += '<span class="productos-cantidad">' + itemOrdenProducto.qty + '</span> ' +
                            '<span class="productos-nombre">Producto sin definir</span>';
                }
            }
        } else {
            resp += '<span class="productos-cantidad">Productos sin definir</span>';
        }
        $("#idTotal2").html('₡' + total);
        return resp;
    }

    function definirFilaProdutoModal2(itemProducto, cantidad) {
        var resp =
                '<div class="row"><div class="col-sm-4">' +
                '<img src="' + itemProducto.image + '" alt=""/>' +
                '</div><div class="col-sm-8">' +
                '<span>' + cantidad + ' - ' + itemProducto.name + '<br></span>' +
                '<span>' + itemProducto.description + '.<br></span>' +
                '<span>₡' + itemProducto.price + '</span>' +
                '</div></div>';
        return resp;
    }
}

