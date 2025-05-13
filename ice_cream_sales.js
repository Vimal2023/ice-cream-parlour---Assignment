const fs = require("fs"); // file system module - provides funstions to read and write files.

function toGetMonth(dateStr) {
  return dateStr.slice(0, 7);
} // to take the months from the date string.

// Function to process sales data from CSV{comma separated Value} string
function salesData(csvData) {
  let totalSales = 0;
  let monthSales = {};
  let monthwiseItemQuantity = {};
  let monthwiseItemRevenue = {};
  let monthwiseItemsOrder = {};

  const lines = csvData.trim().split("\n");

  for (let i = 1; i < lines.length; i++) {
    const [
      date,
      SKU,
      quantity,
      totalPrice,
    ] = lines[i].split(",");

    const month = toGetMonth(date);
    // const unitPriceNum = parseFloat(unitPrice);
    const quantityNum = parseInt(quantity);
    const totalPriceNum = parseFloat(totalPrice);

    totalSales += totalPriceNum;

// month-wise sales
    if (!(month in monthSales)) {
      monthSales[month] = 0;
    }
    monthSales[month] += totalPriceNum;

    // Initialize objects for the month if not present
    if (!(month in monthwiseItemQuantity)) {
      monthwiseItemQuantity[month] = {};
      monthwiseItemRevenue[month] = {};
      monthwiseItemsOrder[month] = {};
    }

     // Update item quantities
    if (!(SKU in monthwiseItemQuantity[month])) {
      monthwiseItemQuantity[month][SKU] = 0;
    }
    monthwiseItemQuantity[month][SKU] += quantityNum;


// Update item revenue
    if (!(SKU in monthwiseItemRevenue[month])) {
      monthwiseItemRevenue[month][SKU] = 0;
    }
    monthwiseItemRevenue[month][SKU] += totalPriceNum;


// Update item order count
    if (!(SKU in monthwiseItemsOrder[month])) {
      monthwiseItemsOrder[month][SKU] = 0;
    }
    monthwiseItemsOrder[month][SKU] += 1;
  }

  return {
    totalSales,
    monthSales,
    monthwiseItemQuantity,
    monthwiseItemRevenue,
    monthwiseItemsOrder,
  };
}

// Function to find the item with the most quantity sold per month
function mostpopularItem(monthwiseItemQuantity) {
  let mostPopularItemEachMonth = {};

  for (let month in monthwiseItemQuantity) {
    let maxQuantity = 0;
    let popluarItemName = null;

    for (let SKU in monthwiseItemQuantity[month]) {
      if (monthwiseItemQuantity[month][SKU] > maxQuantity) {
        maxQuantity = monthwiseItemQuantity[month][SKU];
        popluarItemName = SKU;
      }
    }
    mostPopularItemEachMonth[month] = [popluarItemName, maxQuantity];
  }

  return mostPopularItemEachMonth;
}

// Function to find the item generating the most revenue per month
function mostRevenueItem(monthwiseItemRevenue) {
  let mostRevenueItemEachMonth = {};

  for (let month in monthwiseItemRevenue) {
    let maxRevenue = 0;
    let maxRevenueItem = null;

    for (let SKU in monthwiseItemRevenue[month]) {
      if (monthwiseItemRevenue[month][SKU] > maxRevenue) {
        maxRevenue = monthwiseItemRevenue[month][SKU];
        maxRevenueItem = SKU;
      }
    }
    mostRevenueItemEachMonth[month] = [maxRevenueItem, maxRevenue];
  }
  return mostRevenueItemEachMonth;
}

// Function to compute min, max, and average orders for the most popular item
function fetchOrderStats(mostpopularItem, monthwiseItemsOrder) {
  const SKU = mostpopularItem[Object.keys(mostpopularItem)[0]][0];

  let orderCounts = [];
  for (let month in monthwiseItemsOrder) {
    const orderCount = monthwiseItemsOrder[month][SKU] || 0;
    orderCounts.push(orderCount);
  }

  if (orderCounts.length > 0) {
    const minOrder = Math.min(...orderCounts);
    const maxOrder = Math.max(...orderCounts);
    const avgOrder =
      orderCounts.reduce((sum, val) => sum + val, 0) / orderCounts.length;

    return [minOrder, maxOrder, avgOrder];
  }
  return [0, 0, 0];
}

// function to print the values
function printing(
  totalSales,
  monthSales,
  mostpopularItem,
  maxRevenueItem,
  orderStats
) {
  console.log(`Total Sales : $${totalSales.toFixed(2)}\n`);

  Object.keys(monthSales)
    .sort()
    .forEach((month) => {
      console.log(`${month}: $${monthSales[month].toFixed(2)}`);
    });
  console.log();

  Object.keys(mostpopularItem)
    .sort()
    .forEach((month) => {
      const [item, quantity] = mostpopularItem[month];
      console.log(`${month} : ${item} (${quantity} units)`);
    });
  console.log();

  Object.keys(maxRevenueItem)
    .sort()
    .forEach((month) => {
      const [item, revenue] = maxRevenueItem[month];
      console.log(`${month} : ${item} ($${revenue})`);
    });
  console.log();

  const [minOrder, maxOrder, avgOrder] = orderStats;
  console.log('Order Statistics for Most Popular Item:');
  console.log(`Minimum Orders per Month: ${minOrder}`);
  console.log(`Max Orders per Month: ${maxOrder}`);
  console.log(`Average order per month : ${avgOrder.toFixed(2)}`);
}

// main function
function main() {
  try {
    const csvData = fs.readFileSync("sales_data.txt", "utf-8"); 
    const {
      totalSales,
      monthSales,
      monthwiseItemQuantity,
      monthwiseItemRevenue,
      monthwiseItemsOrder,
    } = salesData(csvData);

    const mostPopular = mostpopularItem(monthwiseItemQuantity);
    const highestRevenue = mostRevenueItem(monthwiseItemRevenue);
    const orderStats = fetchOrderStats(mostPopular, monthwiseItemsOrder);

    printing(totalSales, monthSales, mostPopular, highestRevenue, orderStats);
  } catch (error) {
    console.error("Error is there !", error.message);
  }
}

main();
