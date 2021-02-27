
const manufacturers = [];

const getData = async(type) => {
    const api_url = 'https://bad-api-assignment.reaktor.com/v2/products/'+type;
    const response = await fetch(api_url);
    const data = await response.json();
    return data;
}

const gloves = await getData('gloves')
const masks = await getData('facemasks')
const beanies = await getData('beanies')

let all_data = gloves.concat(masks, beanies);

for (const i of all_data) {
    if (!manufacturers.includes(i.manufacturer)) {
        manufacturers.push(i.manufacturer);
    }
}

const availabilities = {};

const getAvailability = async(brand) => {
    const api_url = 'https://bad-api-assignment.reaktor.com/v2/availability/'+brand;
    const response1 = await fetch(api_url);
    const data = await response1.json();

    availabilities[brand] = {};
    if (data.response.length > 2) {
        console.log(data.response.length);
        for (const j of data.response) {
            if (j.DATAPAYLOAD) {
                availabilities[brand][j.id] = j.DATAPAYLOAD.substring(50, j.DATAPAYLOAD.length-31);
            }
        }
    }   
}
const promises = [];

for (const m in manufacturers) {
    promises.push(
        new Promise((resolve) => resolve(getAvailability(manufacturers[m])))
    );
}

await Promise.all(promises);


const addAvailability = async(data) => {

    for (const item of data) {
        const m_id = item.id.toUpperCase();
        if (availabilities[item.manufacturer][m_id]) {
            item["availability"] = availabilities[item.manufacturer][m_id];
        } else {
            item["availability"] = 'UNKNOWN'; 
        }

    }

    return data;
}

const data = {
    gloves: await addAvailability(gloves),
    masks: await addAvailability(masks),
    beanies: await addAvailability(beanies)
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