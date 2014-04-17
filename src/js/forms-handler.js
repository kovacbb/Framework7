/*===============================================================================
************   Store and parse forms data   ************
===============================================================================*/
app.formsData = {};
app.formStoreData = function (formId, formJSON) {
    // Store form data in app.formsData
    app.formsData[formId] = formJSON;

    // Store form data in local storage also
    app.ls['f7form-' + formId] = JSON.stringify(formJSON);
};
app.formDeleteData = function (formId) {
    // Delete form data from app.formsData
    if (app.formsData[formId]) {
        app.formsData[formId] = '';
        delete app.formsData[formId];
    }

    // Delete form data from local storage also
    if (app.ls['f7form-' + formId]) {
        app.ls['f7form-' + formId] = '';
        delete app.ls['f7form-' + formId];
    }
};
app.formGetData = function (formId) {
    // First of all check in local storage
    if (app.ls['f7form-' + formId]) {
        return JSON.parse(app.ls['f7form-' + formId]);
    }
    // Try to get it from formsData obj
    else if (app.formsData[formId]) return app.formsData[formId];
};
app.formToJSON = function (form) {
    form = $(form);
    if (form.length !== 1) return false;

    // Form data
    var formData = {};

    // Skip input types
    var skipTypes = ['submit', 'image', 'button', 'file'];
    var skipNames = [];
    form.find('input, select, textarea').each(function () {
        var input = $(this);
        var name = input.attr('name');
        var type = input.attr('type');
        var tag = this.nodeName.toLowerCase();
        if (skipTypes.indexOf(type) >= 0) return;
        if (skipNames.indexOf(name) >= 0 || !name) return;
        if (tag === 'select' && input.attr('multiple')) {
            skipNames.push(name);
            formData[name] = [];
            form.find('select[name="' + name + '"] option').each(function () {
                if (this.selected) formData[name].push(this.value);
            });
        }
        else {
            switch (type) {
                case 'checkbox' :
                    skipNames.push(name);
                    formData[name] = [];
                    form.find('input[name="' + name + '"]').each(function () {
                        if (this.checked) formData[name].push(this.value);
                    });
                    break;
                case 'radio' :
                    skipNames.push(name);
                    form.find('input[name="' + name + '"]').each(function () {
                        if (this.checked) formData[name] = this.value;
                    });
                    break;
                default :
                    formData[name] = input.val();
                    break;
            }
        }
            
    });

    return formData;
};
app.formFromJSON = function (form, formData) {
    form = $(form);
    if (form.length !== 1) return false;

    // Skip input types
    var skipTypes = ['submit', 'image', 'button', 'file'];
    var skipNames = [];

    form.find('input, select, textarea').each(function () {
        var input = $(this);
        var name = input.attr('name');
        var type = input.attr('type');
        var tag = this.nodeName.toLowerCase();
        if (!formData[name]) return;
        if (skipTypes.indexOf(type) >= 0) return;
        if (skipNames.indexOf(name) >= 0 || !name) return;
        if (tag === 'select' && input.attr('multiple')) {
            skipNames.push(name);
            form.find('select[name="' + name + '"] option').each(function () {
                if (formData[name].indexOf(this.value) >= 0) this.selected = true;
                else this.selected = false;
            });
        }
        else {
            switch (type) {
                case 'checkbox' :
                    skipNames.push(name);
                    form.find('input[name="' + name + '"]').each(function () {
                        if (formData[name].indexOf(this.value) >= 0) this.checked = true;
                        else this.checked = false;
                    });
                    break;
                case 'radio' :
                    skipNames.push(name);
                    form.find('input[name="' + name + '"]').each(function () {
                        if (formData[name] === this.value) this.checked = true;
                        else this.checked = false;
                    });
                    break;
                default :
                    input.val(formData[name]);
                    break;
            }
        }
            
    });
};
app.initFormsStorage = function (pageContainer) {
    pageContainer = $(pageContainer);
    if (pageContainer.length === 0) return;

    var forms = pageContainer.find('form.store-data');

    // Parse forms data and fill form if there is such data
    forms.each(function () {
        var id = this.getAttribute('id');
        if (!id) return;
        var formData = app.formGetData(id);
        if (formData) app.formFromJSON(this, formData);
    });
    // Update forms data on inputs change
    forms.on('change submit', function () {
        var formId = this.id;
        if (!formId) return;
        var formJSON = app.formToJSON(this);
        if (!formJSON) return;
        app.formStoreData(formId, formJSON);
        $(this).trigger('store', {data: formJSON});
    });
};