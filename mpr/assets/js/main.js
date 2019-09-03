var instagramRodape = function () {

    if (typeof configInstagram !== 'undefined') {

        var user = configInstagram.user;
        var title = configInstagram.title;
        var insta = "<div id='instagram' class='hidden-xs'><h2><span><svg class='icon' xmlns='http://www.w3.org/2000/svg' viewBox='-8700.68 2378.321 32.422 32.421'><path id='Union_72' data-name='Union 72' class='cls-1' d='M7835.447-3201.945a8.957,8.957,0,0,1-8.947-8.947v-14.528a8.957,8.957,0,0,1,8.947-8.946h14.526a8.957,8.957,0,0,1,8.949,8.946v14.528a8.957,8.957,0,0,1-8.949,8.947Zm-6.071-23.475v14.528a6.077,6.077,0,0,0,6.071,6.069h14.528a6.075,6.075,0,0,0,6.069-6.069v-14.528a6.079,6.079,0,0,0-6.071-6.071h-14.526A6.078,6.078,0,0,0,7829.376-3225.42Zm4.98,7.264a8.364,8.364,0,0,1,8.355-8.355,8.363,8.363,0,0,1,8.353,8.355,8.361,8.361,0,0,1-8.353,8.353A8.362,8.362,0,0,1,7834.356-3218.156Zm2.877,0a5.483,5.483,0,0,0,5.478,5.477,5.484,5.484,0,0,0,5.477-5.477,5.484,5.484,0,0,0-5.477-5.477A5.483,5.483,0,0,0,7837.233-3218.156Zm12.692-7.191a2.128,2.128,0,0,1-.622-1.493,2.114,2.114,0,0,1,.622-1.491,2.116,2.116,0,0,1,1.489-.617,2.127,2.127,0,0,1,1.493.617,2.118,2.118,0,0,1,.617,1.491,2.132,2.132,0,0,1-.617,1.493,2.138,2.138,0,0,1-1.493.617A2.123,2.123,0,0,1,7849.926-3225.347Z' transform='translate(-16527.18 5612.687)'/></svg>" + title + "</span><a href='https://instagram.com/" + user + "' target='blank'>@" + user + "</a></h2><ul></ul></div>";

        $(window).load(function () {


            $('#store-content .container').append($(insta));

            if ($('#instagram').length) {
                var $recebePhotos = $('#instagram ul');
                var token = configInstagram.token, // STRING - Alterar Token
                    userid = configInstagram.userid, // INT - Alterar IDs
                    num_photos = 6; // QUANTIDADE DE FOTOS QUE VAI BUSCAR
                $.ajax({
                    url: 'https://api.instagram.com/v1/users/' + userid + '/media/recent',
                    dataType: 'jsonp',
                    type: 'GET',
                    data: {
                        access_token: token,
                        count: num_photos
                    },
                    success: function (data) {
                        for (var x = 0; x < data.data.length; x++) {
                            $recebePhotos.append('<li><a href="' + data.data[x].link + '" target="_blank"><img src="' + data.data[x].images.standard_resolution.url + '" width="250" height="250" /></li>');
                        };
                    },
                    error: function (data) {
                        $('#instagram').hide();
                        console.log(data);
                    }
                });
            };

        });
    }
};


var rastreamento = function () {
    $('.rastreio').append($("<a class='trigger-rastreio'><svg class='icon' xmlns='http://www.w3.org/2000/svg' viewBox='5219.872 13.743 10.5 14'><path class='a' d='M65.9,0a5.25,5.25,0,0,0-4.2,8.4L65.9,14l4.2-5.6A5.25,5.25,0,0,0,65.9,0Zm0,8.75a3.5,3.5,0,1,1,3.5-3.5A3.5,3.5,0,0,1,65.9,8.75Z' transform='translate(5159.221 13.743)'/></svg><span>Rastreie seu pedido</span></a><form class='form-rastreio'><span>Digite o código de rastreio para acompanhar seu pedido:</span><div class='wrap'><input type='text' placeholder='Código'><button class='rastrear'></button></div></form>"));

    $('.rastrear').click(function (e) {
        e.preventDefault();
        var numerosro = $('.form-rastreio input').val();
        var url = 'http://rastreie.me/' + numerosro;
        window.open(url, 'blank');
    });
};

var menuResponsivo = function () {
    $(document).on('click', '.menu-abrir', function () {
        $('html').addClass('menu-ativo');
    });

    $(document).on('click', '.menu-fechar', function () {
        $('html').removeClass('menu-ativo');
    });

    $('#menu .navbar-nav.visible-phone>li.dropdown > a').click(function (e) {
        e.preventDefault();
        $(this).siblings('.dropdown-menu').slideToggle('fast');
    });
};

var headerFixo = function () {
    $(window).scroll(function () {
        ($(this).scrollTop() > 20) ? $('header').addClass('fixed'): $('header').removeClass('fixed');
    });
};

var thumbnails = function(){
    var prev = "<div class='slick-prev'><svg xmlns='http://www.w3.org/2000/svg' viewBox='-1645.645 2663.294 18.489 30'><path id='path' class='cls-1' d='M18.489,3.5,14.991,0,0,15,14.991,30l3.5-3.5L7,15Z' transform='translate(-1645.645 2663.294)'/></svg></div>";
    var next = "<div class='slick-next'><svg xmlns='http://www.w3.org/2000/svg' viewBox='-899.39 2661.217 18.489 30'><g id='Group_909' data-name='Group 909' transform='translate(-2203 2220)'><path id='path' class='cls-1' d='M18.489,3.5,14.991,0,0,15,14.991,30l3.5-3.5L7,15Z' transform='translate(1322.099 471.217) rotate(180)'/></g></svg></div>";

    $('#gallery').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 30000,
        dots: false,
        infinite:false,
        adaptiveHeight: true,
        prevArrow: prev,
        nextArrow: next,
        variableWidth: true,
        responsive: [{
                breakpoint: 600,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
};

$(function () {
    window.location.hash = "";
    instagramRodape();
    rastreamento();
    menuResponsivo();
    headerFixo();
    thumbnails();
    
    //Esconder itens quando a variação do produto estiver indisponível
    $('.prod-variant-btn').click(function () {
        if ($(this).hasClass('variant-unavailable')) {
            $('.quantidade, .addwish-btn-form, .frete').hide();
        } else {
            $('.quantidade, .addwish-btn-form, .frete').show();
        }
    });

    //Bug no valor do popup de produto
    $("button#buy-btn").on("click", function () {
        var variantPrice = $('span.sale.color.variant_price').html();
        $('div#ProdModal span.sale.buy-price strong').html(variantPrice);
    });

    //Busca mobile
    $('#form-phone-search input').on('keyup', function (e) {
        var key = e.keyCode;
        if (key == 38 || key == 40 || key == 13) {
            $('#form-phone-search').submit();
        }
    });

    $(document).on('click', '#form-phone-search button', function () {
        $('#form-phone-search').submit();
    });
});