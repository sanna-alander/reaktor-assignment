
const manufacturers = [];
const gloves = await fetch('https://bad-api-assignment.reaktor.com/v2/products/gloves');
const gloves_data = await gloves.json();
const masks = await fetch('https://bad-api-assignment.reaktor.com/v2/products/facemasks');
const masks_data = await masks.json();
const beanies = await fetch('https://bad-api-assignment.reaktor.com/v2/products/beanies');
const beanies_data = await beanies.json();

const all_data = gloves_data.concat(masks_data, beanies_data);
for (const i of all_data) {
    if (!manufacturers.includes(i.manufacturer)) {
        manufacturers.push(i.manufacturer);
    }
}

const availabilities = {};

const getAvailability = async(brand) => {
    const api_url = 'https://bad-api-assignment.reaktor.com/v2/availability/'+brand;
    const response1 = await fetch(api_url);
    //if (response1) {
        const data = await response1.json();

        availabilities[brand] = {};
        if (data.response.length != 0) {
            for (const j of data.response) {
                if (j.DATAPAYLOAD) {
                    availabilities[brand][j.id] = j.DATAPAYLOAD.substring(50, j.DATAPAYLOAD.length-31);
                }
            }
        }
        
    //}   
}
const promises = [];

for (const m in manufacturers) {
    promises.push(
        new Promise((resolve) => resolve(getAvailability(manufacturers[m])))
    );
}

await Promise.all(promises);


const getItems = async(data) => {

    for (const item of data) {
        const m_id = item.id.toUpperCase();
        if (availabilities[item.manufacturer][m_id]) {
            item["availability"] = availabilities[item.manufacturer][m_id];
        } else {
            item["availability"] = 'UNKNOWN'; 
        }
        

        console.log(item.availability);
    }

    return data;
}

const data = {
    gloves: await getItems(gloves_data),
    masks: await getItems(masks_data),
    beanies: await getItems(beanies_data)
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