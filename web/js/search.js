$(window).on('load',function () {
    loadTable();
});


function loadTable() {

    $('#tblSearch tbody tr').remove();

    var ajaxConfig = {
        method : 'GET',
        url : 'http://localhost:8080/pos/orders',
        async : true,
        contentType : 'application/json'
    };

    $.ajax(ajaxConfig).done(function (response) {

        var orders = response;

        for (var i = 0; i < orders.length; i++) {

            var cname = "";
            var ajaxConfig = {
                method : 'GET',
                url : 'http://localhost:8080/pos/customers',
                async : true,
                contentType : 'application/json'
            };

            var totPrice = 0;

            var orderDetails = orders[i].orderDetails;

            for (var j = 0; j < orderDetails.length; j++) {
                if (orderDetails[j].orderId == orders[i].oid) {
                    totPrice += parseFloat(orderDetails[j].unitPrice) * parseInt(orderDetails[j].qty);
                }
            }

            $('#tblSearch tbody').append(
                '<tr>' +
                '<td>' + orders[i].oid + '</td>' +
                '<td>' + orders[i].date + '</td>' +
                '<td>' + orders[i].name + '</td>' +
                '<td>' + totPrice + '</td>' +
                '</tr>'
            );
            $('#tblSearch tbody tr').last().click(function () {
                showDetails($(this));
            });
        }
    }).fail(function(jqxhr,textStatus,errorMsg) {
        console.log(errorMsg);
    });
}

function showDetails(id){
    $('#tblOrderedItems tbody tr').remove();
    var code = $(id.children('td')[0]).text();

    var ajaxConfig = {
        method : 'GET',
        url : 'http://localhost:8080/pos/orders/'+code,
        async : true,
        contentType : 'application/json'
    };

    $.ajax(ajaxConfig).done(function (response) {
        var orderDetails = response.orderDetails;

        for(var i=0; i<orderDetails.length; i++){

            $('#tblOrderedItems tbody').append(
                '<tr>' +
                '<td>'+orderDetails[i].itemcode+'</td>' +
                '<td>'+orderDetails[i].description+'</td>' +
                '<td>'+orderDetails[i].unitPrice+'</td>' +
                '<td>'+orderDetails[i].qty+'</td>' +
                '<td>'+parseInt(orderDetails[i].qty) * parseFloat(orderDetails[i].unitPrice)+'</td>' +
                '</tr>'
            );

        }
    }).fail(function(jqxhr,textStatus,errorMsg) {
        console.log(errorMsg);
    });

}

$('#txtSearchText').keyup(function () {
    var searchVal = $('#txtSearchText').val();
    if(searchVal.length == 0){
        loadTable();
    }else{
        $('#tblSearch tbody tr').hide();
        // $( 'td:contains('+searchVal+')' ).parent('tr').css('background-color','blue');
        $( 'td:contains('+searchVal+')' ).parent('tr').show();

    }
});