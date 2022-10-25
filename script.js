// definition of data to fetch
const dataSets = {
  videogames: {
    title: "Video Game Sales",
    description: "Top 100 Most Sold Video Games Grouped by Platform",
    url: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
  },
  movies: {
    title: "Movie Sales",
    description: "Top 100 Highest Grossing Movies Grouped By Genre",
    url: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
  },  
  kickstarter: {
    title: 'Kickstarter Pledges',
    description: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
    url: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json'
  }
};


// create menu items
function createMenuItem(name, index, result) {
  let div = document.createElement('div');
  div.textContent = name;
  div.addEventListener('click', () => {drawData(result, index);})
  return div;
}

// fetch all data from dataSets urls
async function fetchURLs() {
  try {
    const urls = Object.keys(dataSets).map(el => {return dataSets[el].url});
    await Promise.all(urls.map((url) => fetch(url).then((response) => response.json())))
      .then((result) => {
        const menu = document.getElementById('menu');
        Object.keys(dataSets).forEach((key, index) => {
            menu.appendChild(createMenuItem(dataSets[key].title, index, result));
        });
        drawData(result, 0);
      });
   } catch (error) {
      document.getElementById('chart').textContent = 'Error loading data - ' + error;
   }
 }

// entry point
fetchURLs();

// draws data based on index
function drawData(data, index) {
  //const [videogames, movies, kickstarter]  = data;
  
  // reset chart
  document.querySelector('#chart').remove();
  function divChart() {
    let div = document.createElement('div');
    div.id = 'chart';
    return div;
  }
  document.querySelector('body').appendChild(divChart());
  
  data = data[index];

  const width = 1000;
  const height = 1000;
  
  // append title and description
  const div = d3.select('#chart');
  div
    .append('h1')
    .attr('id', 'title')
    .text(dataSets[Object.keys(dataSets)[index]].title)
    .append('h5')
    .attr('id', 'description')
    .text(dataSets[Object.keys(dataSets)[index]].description);
  
  // append tooltip
  div.append('div').attr('id', 'tooltip');
  
  const toolTip = d3.select('#tooltip');
  toolTip.style('opacity', 0);
  
  // get names of categories
  const categories = data.children.map(el => el.name);
  
  // color scheme
  let color = d3.scaleSequential()
  .domain([0, categories.length])
  .interpolator(d3.interpolateRainbow);
  
  // legend
    const legendItemWidth = width / categories.length;
  
    const legendItems = div
    .append('svg')
    .attr('viewBox', `0 0  ${width} 30`)
    .attr('id', 'legend')
    .selectAll('rect')
    .data(categories)
    .enter();
    
    legendItems
    .append('rect')
    .style('fill', (d) => { return color(categories.indexOf(d)) })
    .classed('legend-item', true)
    .attr('x', (d) => { return categories.indexOf(d) * legendItemWidth; })
    .attr('y', 0)
    .attr('width', legendItemWidth + 'px')
    .attr('height', '30px')
    .attr('stroke', 'white')
    .on('mouseover', (event, d) => {
        toolTip.style('opacity', 0.9);
        toolTip
        .html(() => { return d })
        .style('left', event.layerX + 'px')
        .style('top', event.layerY + 'px'); 
        })
    .on('mouseout', () => toolTip.style('opacity', 0));
    legendItems
    .append('text')
    .attr('dy', '.35em')
    .attr('x', (d) => { return categories.indexOf(d) * legendItemWidth + 5; })
    .attr('y', 15)
    .text( (d) => { 
      if(d.length > 6 ) {
        return d.slice(0, 6)+ '...'
      } 
      return d; 
    })
    .on('mouseover', (event, d) => {
        toolTip.style('opacity', 0.9);
        toolTip
        .html(() => { return d })
        .style('left', event.layerX + 'px')
        .style('top', event.layerY + 'px'); 
        })
    .on('mouseout', () => toolTip.style('opacity', 0));
  
  
  // append the svg object to the the page
  const svg = d3.select('#chart')
  .append('svg')
  .attr('viewBox', `0 0  ${width} ${height}`)
  .append('g');

  // Give the data to this cluster layout:
  const root = d3.hierarchy(data)
  .sum((d) => { return d.value}) // Here the size of each leave is given in the „value” field in input data
  .sort((a,b) => { return b.height - a.height || b.value - a.value;}); // And sort data

  // Then d3.treemap computes the position of each element of the hierarchy
  const tree = d3.treemap()
    .size([width, height])
    .padding(2)
    .paddingInner(1)
    (root)

  // use this information to add rectangles:
  svg
    .selectAll('rect')
    .data(root.leaves())
    .join('rect')
      .attr('class', 'tile')
      .attr('data-name', (d) => { return d.data.name })
      .attr('data-category', (d) => { return d.data.category })
      .attr('data-value', (d) => { return d.data.value })
      .attr('x', (d) => { return d.x0; })
      .attr('y', (d) => { return d.y0; })
      .attr('width', (d) => { return d.x1 - d.x0; })
      .attr('height', (d) => { return d.y1 - d.y0; })
      .style('fill', (d) => { return color(categories.indexOf(d.data.category)); });

  // and to add the text labels
  const labels = svg
    .selectAll('text')
    .data(root.leaves())
    .join('text')
    .attr('class', 'labels')
    .attr('width', (d) => { return d.x1 - d.x0; })
    .attr('height', (d) => { return d.y1 - d.y0; })
    .attr('transform', (d) => { return 'translate(' + d.x0 + ',' + d.y0 + ')'; });
    
    labels
    .selectAll('tspan')
    .data((d) => {
      if(d.data.name.length >=15 ) {
        return (d.data.name.substring(0, 15)+ '...').split(/(?=[A-Z][^A-Z])/g);
      }
      return d.data.name.split(/(?=[A-Z][^A-Z])/g); 
    })
    .enter()
    .append('tspan')
    .attr('class', 'tspans')
    .attr('x', 5)
    .attr('y', (d, i) => { return 20 + i * 17; })
    .text((d) => { return d; });
 
  // tooltip
  handleMouseOver(labels);
  handleMouseOver(svg.selectAll('rect'));
  
  function handleMouseOver(element) {
    element
      .on('mouseover', (event, d) => {
        toolTip.style('opacity', 0.9);
        toolTip
          .html(() => {
            return ('Name: ' + d.data.name + ', <br>Category: ' + d.data.category + '<br>Value: ' + d.data.value);
          })
          .attr('data-value', () => { return d.data.value })
          .style('left', event.layerX -50 + 'px')
          .style('top', event.layerY + 'px');
      })
      .on('mouseout', () => toolTip.style('opacity', 0));  
  }
}