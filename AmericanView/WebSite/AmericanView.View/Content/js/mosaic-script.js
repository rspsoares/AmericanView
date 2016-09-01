$(document).ready(function () {
    kendo.culture("pt-BR");
    //var dsMenuLateral = JSON.parse(localStorage.getItem('leftMenuLateral'));
    var dsMenuLateral = null;

    if (dsMenuLateral == null) {
        menuLateral();
        localStorage.setItem('leftMenuLateral', JSON.stringify($('#Left-Container').html()));
    }
    else{
        $('#Left-Container').html('');
        $('#Left-Container').html(dsMenuLateral);        
    }

    $('.minimize-menu').click(function () {
        //localStorage.clear();
        if ($(this).attr('class') == 'minimize-menu disable') {
            minimizeMenuLateral();
        }
        else {
            maximizeMenuLateral();
        }

        /* -- MENU - MINI -- */
        $('.mini-nav ul.nav-list li').click(function () {
            //alert($(this).children('ul').html());
            if ($(this).children('ul').attr('style') == 'display: block;') {
                $(this).children('ul').hide();
                $(this).removeAttr('style');
            }
            else {
                $(this).children('ul').show();
                $(this).attr('style', 'background-color: #00549F; color: #fff;');
            }

        });
    });

    // Function Collapse Icon
    $('#accordion .panel .panel-heading').click(function () {
        var iconCollapse = $(this).children('h4').children('small').children('span').attr('class');
        if (iconCollapse == "glyphicon glyphicon-chevron-right") {
            $(this).children('h4').children('small').children('span').removeAttr('class');
            $(this).children('h4').children('small').children('span').attr('class', 'glyphicon glyphicon-chevron-down');
        }
        else {
            $(this).children('h4').children('small').children('span').removeAttr('class');
            $(this).children('h4').children('small').children('span').attr('class', 'glyphicon glyphicon-chevron-right');
        }
    });
});

function menuLateral() {
    $.ajax({
        //url: "/Content/js/app/menu-lateral.js",
        url: "/Roles/MenuLateral",
        type: "GET",
        dataType: "json",
        async: false,
        success: function (result) {
            this.menuLateral = '';
            this.menuMobile = ''
            for (var i in result) {
                if (result[i].isActive) {
                    if (result[i].subMenu.length == 0) {
                        /* -- MENU LATERAL -- */
                        this.menuLateral += '<li id="' + result[i].id + '"><a href="' + result[i].link + '" title="' + result[i].name + '">'
                            + '<span class="glyphicon ' + result[i].icon + '"></span>'
                            + '<span class="item">' + result[i].name + '</span></a></li>';
                        /* -- MENU MOBILE -- */
                        this.menuMobile += '<li><a href="' + result[i].link + '" title="' + result[i].name + '">'
                            + '<span class="glyphicon ' + result[i].icon + '"></span>'
                            + '<span>' + result[i].name + '</span></a></li>';
                    }
                    else {
                        /* -- MENU LATERAL -- */
                        this.menuLateral += '<li id="' + result[i].id + '" title="' + result[i].name + '">'
                            + '<span class="glyphicon ' + result[i].icon + '"></span>'
                            + '<span class="nav-title-item">' + result[i].name + '</span><ul>';
                        /* -- MENU MOBILE -- */
                        this.menuMobile += '<li>'
                            + '<span class="glyphicon ' + result[i].icon + '"></span>'
                            + '<span>' + result[i].name + '</span><ul class="submenu-menu-lista">';

                        for (var f in result[i].subMenu) {
                            if (result[i].subMenu[f].isActive) {
                                /* -- MENU LATERAL -- */
                                this.menuLateral += '<li id="' + result[i].subMenu[f].id + '"><a href="' + result[i].subMenu[f].link + '" title="' + result[i].subMenu[f].name + '">'
                                    + '<span class="item">' + result[i].subMenu[f].name + '</span></a></li>';
                                /* -- MENU MOBILE -- */
                                this.menuMobile += '<li><a href="' + result[i].subMenu[f].link + '" title="' + result[i].subMenu[f].name + '">'
                                    + '<span>' + result[i].subMenu[f].name + '</span></a></li>';
                            }
                        }
                        /* -- MENU LATERAL -- */
                        this.menuLateral += '</li></ul>';
                        /* -- MENU MOBILE -- */
                        this.menuMobile += '</li></ul>';
                    }
                }
            }
            /* -- MENU LATERAL -- */
            $('#Left-Container .nav-menu .nav-list').html(this.menuLateral);

            /* -- MENU MOBILE -- */
            $('#nav-menu-mobile .nav-list-mobile').html(this.menuMobile);
            var listmenu = $(function () {
                //Menu lista ao clicar no icone
                $('#icone-lista').on('click', this, function () {
                    //$('#nav-menu-mobile').addClass('active');
                    $('.nav-list-mobile').slideToggle();
                });

                //Efeito Drop no menu lista
                $('.nav-list-mobile > li > a').on('click', this, function () {
                    var active = $(this).attr('class');
                    if (active == 'active-item') {
                        $(this).next('.submenu-menu-lista').slideToggle();
                    }
                    else {
                        $('.submenu-menu-lista').slideUp();
                        $(this).next('.submenu-menu-lista').slideToggle();
                    }
                    $('.nav-list-mobile > li > a').removeAttr('class', 'active-item');
                    $(this).attr('class', 'active-item');
                });
            });
        },
        error: function (error) {
            alert('Erro ao carregar o Menu Lateral!' + error);
        }
    });
}

function minimizeMenuLateral() {
    $('#btnMinimizarMenuLateral').insertAfter('#menuLateralLiteral');
    $('#Left-Container .nav-menu').addClass("mini-nav");
    $('body').attr('style', 'background: url("/Content/images/layout/bg-menu-mini.jpg") left top repeat-y;');
    $('html').attr('style', 'background: transparent !important;');

    $('ul.nav-list li ul').each(function () {
        $(this).hide();
    });
    $('#Left-Container').animate({
        width: '40px'
    }, 30);
    $('#Center-Container').animate({
        paddingLeft: '40px'
    }, 30);

    $('.minimize-menu').removeClass("disable");
    $('.minimize-menu').addClass("active");
    $('.minimize-menu span').removeClass('glyphicon-circle-arrow-left');
    $('.minimize-menu span').addClass('glyphicon-circle-arrow-right');
}

function maximizeMenuLateral() {
    $('.mini-nav ul.nav-list li').each(function () {
        $(this).removeAttr('style');
    });

    $('#Left-Container').animate({
        width: '220px'
    }, 30, function () {
        $('#Left-Container .nav-menu').removeClass("mini-nav");
        $('body').attr('style', 'background: url("/Content/images/layout/bg-menu-big.jpg") left top repeat-y;');
    });
    $('#Center-Container').animate({
        paddingLeft: '220px'
    }, 30);

    $('.minimize-menu').removeClass("active");
    $('.minimize-menu').addClass("disable");
    $('.minimize-menu span').removeClass('glyphicon-circle-arrow-right');
    $('.minimize-menu span').addClass('glyphicon-circle-arrow-left');
    $('.mini-nav ul.nav-list li ul').each(function () {
        $(this).show();
    });
    $('#btnMinimizarMenuLateral').insertBefore('#menuLateralLiteral');
}

/* -- Filtros Functions -- */
function FormatDateKendo(date) {
    date = date.split(/\//);
    date = [date[1], date[0], date[2]].join('/');
    date = new Date(date);

    return date;
}

function BuscarDadosGrid(grid, msgNenhumRegistro) {
    $filter = new Array();
    var orfilter = "";

    if (grid == undefined)
        grid = $("#grid").data("kendoGrid");
    
    if (msgNenhumRegistro == undefined) {
        msgNenhumRegistro = "Nenhum registro encontrado!";
    }

    $(".filter").each(function (index, ele) {
        switch ($(this).val()) {
            case "":
            case "Escolha ...":
                break;

            default:
                if ($(ele).data("type") == "date") {
                    $filter.push({ field: $(ele).data("field"),type: $(ele).data("type"), operator: $(ele).data("operator"), value: FormatDateKendo($(ele).val()) });
                }
                else {
                    $filter.push({ field: $(ele).data("field"), type: $(ele).data("type"), operator: ele.dataset.operator, value: $(ele).val() });
                }
                break;
        }
    });

    if ($filter.length >= 2 || ($filter.length == 1 && $filter[0].type == "date")) {
        orfilter = { logic: "and", filters: $filter };
    }
    else {
        orfilter = { filters: $filter };
    }

    grid.dataSource.filter(orfilter);

    if(grid.dataSource.total() == 0)
    {
        ShowModalAlerta(msgNenhumRegistro);
    }
}

/* -- Formatação de Moeda -- */
Number.prototype.FormatarMoeda = function (places, symbol, thousand, decimal, negativoParenteses) {
    var valorFormatado;
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "";
    thousand = thousand || ".";
    decimal = decimal || ",";
    var number = this,
	    negative = number < 0 ? "-" : "",
	    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
	    j = (j = i.length) > 3 ? j % 3 : 0;
    
    if (negative == "-" && negativoParenteses == true)   
        valorFormatado = symbol + '(' + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "") + ')';    
    else    
        valorFormatado = symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
    
    return valorFormatado; // symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
};

Number.prototype.FormatarMilhar = function () {
    var parts = (this + "").split(","),
        main = parts[0],
        len = main.length,
        output = "",
        i = len - 1;

    while (i >= 0) {
        output = main.charAt(i) + output;
        if ((len - i) % 3 === 0 && i > 0) {
            output = "." + output;
        }
        --i;
    }
    // put decimal part back
    if (parts.length > 1) {
        output += "," + parts[1];
    }
    return output;
}

Number.prototype.formatMoney = function (c, d, t) {
    var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

/* -- Gerais -- */
function OrdenarListBox(listbox) {
    var $r = $(listbox + " option");
    $r.sort(function (a, b) {
        return (a.value < b.value) ? -1 : (a.value > b.value) ? 1 : 0;        
    });
    $($r).remove();
    $(listbox).append($($r));
}

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

/* -- Cookies -- */
function GerarCookie(strCookie, strValor, lngDias) {
    $.cookie(strCookie, strValor, {
        expires: lngDias
    });
}

function LerCookie(nomeCookie) {
    if ($.cookie(nomeCookie) != null) {
        return $.cookie(nomeCookie);
    }
    else {
        return undefined;
    }
}

function LimparCookie(strCookie) {
    $.cookie(strCookie, null);
}

/* -- MODAL POPUPs -- */
function FecharModal(e) {
    $('#' + e.parentElement.parentElement.parentElement.parentElement.id).data('data', null);
    $('#' + e.parentElement.parentElement.parentElement.parentElement.id).modal("hide");    
}

function FecharModalResumo(e) {
    $('#' + e.parentElement.parentElement.parentElement.parentElement.parentElement.id).modal("hide");
}
 
function GerarPDF(e, orientacaoPaisagem) {
    var printHtml = '#' + e.parentElement.parentElement.parentElement.parentElement.id + ' .modal-dialog .modal-body .body-message';
    printHtml = { "html": $(printHtml).html() };    

    $.ajax({
        url: "/Home/GerarPDF",
        type: "POST",
        async: false,
        data: JSON.stringify({ html: printHtml.html, orientacaoPaisagem: orientacaoPaisagem }),
        contentType: 'application/json; charset=utf-8',
        success: function (result) {
            if (result.Sucesso) {                
                window.open(result.Link, '_blank');                            
            }
            else {
                ShowModalAlerta(result.Msg);
            }  
        }        
    });      
}

function ShowModalResumo(title, dataHtml) {
    $('#modalResumo').modal({ backdrop: 'static', keyboard: false });
    $('#modalResumo .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalResumo .modal-dialog .modal-header center .modal-title strong').html(title);
    $('#modalResumo .modal-dialog .modal-body').html("");
    $('#modalResumo .modal-dialog .modal-body').html(dataHtml);
}

function ShowModalAlerta(dataHtml) {
    $('#modalAlert').modal({ backdrop: 'static', keyboard: false });
    $('#modalAlert .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalAlert .modal-dialog .modal-header center .modal-title strong').html("Atenção");
    $('#modalAlert .modal-dialog .modal-body .alert').html("");
    $('#modalAlert .modal-dialog .modal-body .alert').html(dataHtml);
}

function ShowModalSucesso(dataHtml) {
    $('#modalSuccess').modal({ backdrop: 'static', keyboard: false });
    $('#modalSuccess .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalSuccess .modal-dialog .modal-header center .modal-title strong').html("Sucesso");
    $('#modalSuccess .modal-dialog .modal-body .alert').html("");
    $('#modalSuccess .modal-dialog .modal-body .alert').html(dataHtml);
}

jQuery.extend({
    compare: function (arrayA, arrayB) {
        if (arrayA.length != arrayB.length) { return false; }
        // sort modifies original array
        // (which are passed by reference to our method!)
        // so clone the arrays before sorting
        var a = jQuery.extend(true, [], arrayA);
        var b = jQuery.extend(true, [], arrayB);
        a.sort(); 
        b.sort();
        for (var i = 0, l = a.length; i < l; i++) {
            if (a[i] !== b[i]) { 
                return false;
            }
        }
        return true;
    }
});

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

