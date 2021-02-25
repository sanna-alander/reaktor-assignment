const getAvailability = async(brand, id) => {
    const api_url = 'https://bad-api-assignment.reaktor.com/v2/availability/'+brand;
    var a = null;
    const response1 = await fetch(api_url);
    const data = await response1.json();
    var count = 0;
    
    while (a == null && count < data.response.length) {
        if (data.response[count].id == id) {
            a = data.response[count].DATAPAYLOAD;
        }
        count++;  
    }
    
    return a;
}

const getItems = async(items) => {
    const api_url = 'https://bad-api-assignment.reaktor.com/v2/products/'+items;
    const response1 = await fetch(api_url);
    const data = await response1.json();

    const finalData = [];

    /*for (const item of data) {

        finalData.push({ 
            name: item.DATAPAYLOAD, 
            id: item.id,
            type: item.DATAPAYLOAD,
            color: item.DATAPAYLOAD,
            price: item.DATAPAYLOAD, 
            manufacturer: item.DATAPAYLOAD, 
            availability: 'INSTOCK'
        });

        item["availability"] = await getAvailability(item.manufacturer, item.id);
    }*/
    //console.log(data);

    return await data;
}

const data = {
    gloves: await getItems('gloves'),
    masks: await getItems('facemasks'),
    beanies: await getItems('beanies')
};

const showGloves = async({render}) => {
    render('gloves.ejs', data);
}

const showMasks = async({render}) => {
    render('masks.ejs', data);
  }

const showBeanies = async({render}) => {
    render('beanies.ejs', data);
}


export { showGloves, showMasks, showBeanies }