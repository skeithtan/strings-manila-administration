var refreshStalls;
var refreshProducts;

var refreshStockInventory;


$(() => {
    //MARK: - Entity Management
    //Stalls
    $('#add-stall-button').click(onAddStallButtonClick);
    $('#rename-stall-button').click(onRenameStallButtonClick);
    $('#delete-stall-button').click(onDeleteStallButtonClick);
    $('#add-stall-modal').on('hidden.bs.modal', () => {
        $('#add-stall-name-input').val('');
    });

    //Products
    setUpAddProductModal();
    $('#add-singular-product-button').click(onAddSingularProductButtonClick);
    $('#add-tiered-product-button').click(onAddTieredProductButtonClick);
    $('#modify-singular-product-button').click(onModifySingularProductButtonClick);
    $('#modify-tiered-product-button').click(onModifyTieredProductButtonClick);
    $('#delete-product-button').click(onDeleteProductButtonClick);
    $('#add-product-modal').on('hidden.bs.modal', () => {
        const modal = $('#add-product-modal');
        modal.find('input').each((index, input) => {
            $(input).val('');
        });

        modal.find('textarea').each((index, textarea) => {
            $(textarea).val('');
        });

        modal.find('.extra-tier-row').each((index, tierRow) => {
            $(tierRow).remove();
        });
    });


    //Restock
    $('#restock-button').click(onRestockButtonClick);
});

//MARK: - Stalls
function onAddStallButtonClick() {
    const stallName = $('#add-stall-name-input').val();

    $.ajax({
        url: baseURL + 'stalls/',
        type: 'POST',
        data: {
            name: stallName
        },
        beforeSend: authorizeXHR,
        success: () => {
            iziToast.success({
                title: 'Added',
                message: 'Successfully added stall.'
            });

            refreshStalls();
        },
        error: response => {
            console.log(response);
            iziToast.error({
                title: 'Error',
                message: 'Unable to add stall.'
            })
        },
    });

}

function onRenameStallButtonClick() {
    const stallNameInput = $('#rename-stall-name-input');
    const stallName = stallNameInput.val();
    const stallID = $('#rename-stall-id').val();
    stallNameInput.val('');

    $.ajax({
        url: `${baseURL}stalls/${stallID}/`,
        method: 'PUT',
        data: {
            name: stallName
        },
        beforeSend: authorizeXHR,
        success: () => {
            iziToast.success({
                title: 'Renamed',
                message: 'Successfully renamed stall.'
            });

            refreshStalls();
        },
        error: response => {
            console.log(response);
            iziToast.error({
                title: 'Error',
                id: 'uploading-image-toast',
                message: 'Unable to rename stall.'
            })
        },
    });
}

function onDeleteStallButtonClick() {
    const stallID = $('#delete-stall-id').val();
    $.ajax({
        url: `${baseURL}stalls/${stallID}/`,
        method: 'DELETE',
        beforeSend: authorizeXHR,
        success: () => {
            iziToast.success({
                title: 'Discontinued',
                message: 'Stall is now discontinued.'
            });
            refreshStalls();
        },
        error: response => {
            console.log(response);
            iziToast.error({
                title: 'Error',
                message: 'Could not discontinue stall.'
            })
        },
    })
}

//Fill outs

function fillOutRenameStallModal(activeStall) {
    $('#rename-stall-id').val(activeStall.id);
    $('#rename-stall-name-input').val(activeStall.name);
    $('#rename-stall-button').attr('disabled', false); //Form is already filled out, do not disable submit button
}

function fillOutDeleteStallModal(activeStall) {
    $('#delete-stall-id').val(activeStall.id);
    $('b.delete-stall-name').html(activeStall.name);
}


//MARK: - Products
function setUpAddProductModal() {
    $('#add-tiered-product-card').hide();

    $('#add-singular-product-tab').click(() => {
        $('#add-tiered-product-card').hide();
        $('#add-singular-product-card').show();
    });

    $('#add-tiered-product-tab').click(() => {
        $('#add-singular-product-card').hide();
        $('#add-tiered-product-card').show();
    });

    $('#add-tier-button').click(() => {
        const clone = $('#tier-row-clone').clone();
        clone.removeAttr('id');
        clone.appendTo($('#tiers-set'));

        $('#add-tiered-product-button').attr('disabled', true);

        const deleteButton = $(clone.find('.tier-row-remove')[0]);
        deleteButton.click(() => {
            clone.remove();
            recalculateValidator();
        });

        recalculateValidator();
    });

    function recalculateValidator() {
        const inputs = $('#add-tiered-product-card').find('.text-input');

        //Remove old validator
        inputs.each((index, item) => {
            $(item).off('input');
        });

        addValidation({
            inputs: inputs,
            button: $('#add-tiered-product-button')
        });
    }

}

function displayUploadingToast() {
    const id = randomString();
    iziToast.info({
        title: 'Uploading image...',
        id: id,
        timeout: false
    });

    return id;
}

function hideUploadingToast(id) {
    iziToast.hide({}, document.getElementById(id));
}

function submitAddProduct(product, stallID, image) {
    function submit(product) {
        $.ajax({
            url: `${baseURL}stalls/${stallID}/products/`,
            method: 'POST',
            data: JSON.stringify(product),
            contentType: 'application/json; charset=utf-8',
            beforeSend: authorizeXHR,
            success: () => {
                iziToast.success({
                    title: 'Added',
                    message: 'Successfully added product'
                });
                refreshProducts();
            },
            error: response => {
                console.log(response.responseText);
                iziToast.error({
                    title: 'Error',
                    message: 'Unable to add product'
                })
            }
        });
    }

    if (image !== null) {
        uploadImage({
            image: image,
            success: response => {
                product.image = response.data.link;
                submit(product)
            },
            error: response => {
                console.log(response);
                submit(product);
            }
        })
    } else {
        submit(product);
    }
}

function submitModifyProduct(product, productID, image) {
    function submit(product) {
        $.ajax({
            url: `${baseURL}products/${productID}/`,
            method: 'PATCH',
            data: JSON.stringify(product),
            contentType: 'application/json; charset=utf-8',
            beforeSend: authorizeXHR,
            success: () => {
                iziToast.success({
                    title: 'Modified',
                    message: 'Successfully modified product'
                });
                refreshProducts();
            },
            error: response => {
                console.log(response.responseText);
                iziToast.error({
                    title: 'Error',
                    message: 'Unable to modify product'
                });
            }
        })
    }

    if (image !== null) {
        uploadImage({
            image: image,
            success: response => {
                product.image = response.data.link;
                submit(product);
            },
            error: response => {
                console.log(response);
                submit(product);
            }
        })
    } else {
        submit(product)
    }
}

function uploadImage(data) {
    const image = data.image;
    const form = new FormData();
    form.append('image', image);

    const uploadToastID = displayUploadingToast();
    $.post({
        url: 'https://api.imgur.com/3/image',
        async: true,
        data: form,
        contentType: false,
        processData: false,
        success: response => {
            hideUploadingToast(uploadToastID);
            iziToast.success({
                title: 'Uploaded',
                message: 'Image has been uploaded.'
            });
            data.success(response);
        },
        error: response => {
            hideUploadingToast(uploadToastID);
            iziToast.warning({
                title: 'Error',
                message: 'Unable to upload photo. Using default photo instead.'
            });
            data.error(response);
        },
        beforeSend: xhr => {
            xhr.setRequestHeader('Authorization', 'Client-ID 715b55f24db9cd2')
        }
    });

}

function onAddSingularProductButtonClick() {
    const name = $('#add-singular-product-name-input').val();
    const imageInput = $('#add-singular-product-image-input')[0].files;
    const stallID = $('#add-product-stall-id').val();

    let product = {
        name: name,
        description: $('#add-singular-product-description-input').val(),
        tiers: [{
            name: name,
            price: $('#add-singular-product-price-input').val(),
        }]
    };

    if (imageInput.length) {
        const image = imageInput[0];
        submitAddProduct(product, stallID, image);
    } else {
        submitAddProduct(product, stallID, null);
    }
}

function onAddTieredProductButtonClick() {
    let product = {
        name: $('#add-tiered-product-name-input').val(),
        description: $('#add-tiered-product-description-input').val(),
        tiers: []
    };

    const imageInput = $('#add-singular-product-image-input')[0].files;
    const stallID = $('#add-product-stall-id').val();

    $('#tiers-set').find('.tier-row').each((index, item) => {
        const tierRow = $(item);
        const tier = {
            name: tierRow.find('.tier-name')[0].value,
            price: tierRow.find('.tier-price')[0].value
        };

        product.tiers.push(tier);
    });

    if (imageInput.length) {
        const image = imageInput[0];
        submitAddProduct(product, stallID, image);
    } else {
        submitAddProduct(product, stallID, null);
    }
}

function onModifySingularProductButtonClick() {
    const imageInput = $('#modify-singular-product-image-input')[0].files;
    const productID = $('#modify-product-id').val();
    const name = $('#modify-singular-product-name-input').val();

    let product = {
        name: name,
        description: $('#modify-singular-product-description-input').val(),
        tiers: [{
            id: $('#modify-singular-product-tier-id').val(),
            name: name,
            price: $('#modify-singular-product-price-input').val(),
        }]
    };

    if (imageInput.length) {
        const image = imageInput[0];
        submitModifyProduct(product, productID, image);
    } else {
        submitModifyProduct(product, productID, null);
    }
}

function onModifyTieredProductButtonClick() {
    const imageInput = $('#modify-tiered-product-image-input')[0].files;
    const productID = $('#modify-product-id').val();

    let product = {
        name: $('#modify-tiered-product-name-input').val(),
        description: $('#modify-tiered-product-description-input').val(),
        tiers: []
    };

    $('#modify-tiers-set').find('.modify-tier-row').each((index, item) => {
        const tierRow = $(item);
        const tier = {
            id: tierRow.find('.tier-row-id')[0].value,
            name: tierRow.find('.tier-name')[0].value,
            price: tierRow.find('.tier-price')[0].value
        };

        product.tiers.push(tier);
    });

    if (imageInput.length) {
        const image = imageInput[0];
        submitModifyProduct(product, productID, image);
    } else {
        submitModifyProduct(product, productID, null);
    }
}

function onDeleteProductButtonClick() {
    const productID = $('#delete-product-id').val();
    $.ajax({
        url: `${baseURL}products/${productID}/`,
        method: 'DELETE',
        beforeSend: authorizeXHR,
        success: () => {
            iziToast.success({
                title: 'Discontinued',
                message: 'Product is now discontinued.'
            });
            refreshProducts();
        },
        error: response => {
            console.log(response);
            iziToast.error({
                title: 'Error',
                message: 'Could not discontinue product.'
            })
        }
    })
}

//Fill Outs
function fillOutSingularProductModal(product) {
    $('#modify-singular-product-body').show();
    $('#modify-tiered-product-body').hide();

    $('#modify-singular-product-tier-id').val(product.tiers[0].id);
    $('#modify-singular-product-name-input').val(product.name);
    $('#modify-singular-product-price-input').val(product.tiers[0].currentPrice);
    $('#modify-singular-product-description-input').val(product.description);

    $('#modify-singular-product-button').attr('disabled', false); //Form is filled out - no need to disable button
}

function fillOutTieredProductModal(product) {

    function recalculateValidator() {
        const inputs = $('#modify-tiered-product-body').find('.text-input');

        //Remove old validator
        inputs.each((index, item) => {
            $(item).off('input');
        });

        addValidation({
            inputs: inputs,
            button: $('#modify-tiered-product-button')
        });
    }

    $('#modify-singular-product-body').hide();
    $('#modify-tiered-product-body').show();

    $('#modify-tiered-product-name-input').val(product.name);
    $('#modify-tiered-product-description-input').val(product.description);

    $('#modify-tiers-set').html('');

    product.tiers.forEach(tier => {
        const clone = $('#modify-tier-row-clone').clone();
        clone.removeAttr('id');

        $(clone.find('.tier-row-id')[0]).val(tier.id);
        $(clone.find('.tier-name')[0]).val(tier.name);
        $(clone.find('.tier-price')[0]).val(parseFloat(tier.currentPrice));

        $('#modify-tiers-set').append(clone);
    });

    recalculateValidator();
}

function fillOutModifyProductModal(product) {
    $('#modify-product-id').val(product.id);
    const isSingular = product.tiers.length === 1;

    if (isSingular) {
        fillOutSingularProductModal(product);
    } else {
        fillOutTieredProductModal(product);
    }
}

function fillOutAddProductModal(activeStall) {
    $('#add-product-stall-id').val(activeStall.id);
}

function fillOutDeleteProductModal(product) {
    $('#delete-product-id').val(product.id);
    $('b.delete-product-name').html(product.name);
}


//MARK: - Stock Inventory
function onRestockButtonClick() {
    const tierID = $('#restock-tier-id').val();
    const quantity = $('#restock-quantity').val();
    const isAdd = $('#restock-add').is(':checked');

    $.ajax({
        url: `${baseURL}product-tiers/${tierID}/restock/`,
        method: 'POST',
        data: {
            quantity: quantity,
            add: isAdd
        },
        beforeSend: authorizeXHR,
        success: () => {
            iziToast.success({
                title: 'Restocked',
                message: 'Successfully restocked product'
            });
            refreshStockInventory();
        },
        error: response => {
            console.log(response);
            iziToast.error({
                title: 'Error',
                message: 'Unable to restock product'
            });
        }
    })
}

//Fill Out
function fillOutRestockModal(tier) {
    $('#restock-tier-id').val(tier.id);
    $('#restock-modal-product-name').html(tier.productDescription.name);
    $('#restock-modal-product-quantity').html(tier.quantity);

    if (tier.isSingular) {
        $("#restock-modal-tier-row").hide();
    } else {
        $("#restock-modal-tier-row").show();
        $("#restock-modal-tier-name").html(tier.name);
    }

    if (tier.quantity === 0) {
        $('#restock-button-group').hide();
        $('#restock-dummy-button-group').show();
    } else {
        $('#restock-button-group').show();
        $('#restock-dummy-button-group').hide();
    }
}

//MARK: - XHR Authorization
function authorizeXHR(xhr) {
    xhr.setRequestHeader("Authorization", "Token " + localStorage.token)
}

//MARK: - Random String Generator
function randomString() {
    // Random string with very little collision possibility
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}