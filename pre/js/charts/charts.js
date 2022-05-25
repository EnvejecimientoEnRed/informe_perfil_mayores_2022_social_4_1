//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas3 } from '../helpers';
import { getInTooltip, getOutTooltip, positionTooltip } from '../modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C',
COLOR_GREY_1 = '#A3A3A3',
COLOR_ANAG_PRIM_1 = '#BA9D5F',
COLOR_ANAG_PRIM_3 = '#9E3515';
let tooltip = d3.select('#tooltip');

//Diccionario
let dictionary = {
    one_adult: 'Soledad',
    couple_alone: 'Pareja sola',
    couple_with_others: 'Pareja con otras personas',
    other_forms: 'Otras formas'
}

export function initChart() {
    //Desarrollo del gráfico
    d3.csv('https://raw.githubusercontent.com/EnvejecimientoEnRed/informe_perfil_mayores_2022_social_4_1/main/data/convivencia_mas65_eurostat.csv', function(error,data) {
        if (error) throw error;
        //Declaramos fuera las variables genéricas
        let margin = {top: 12.5, right: 10, bottom: 25, left: 32.5},
            width = document.getElementById('bars--first').clientWidth - margin.left - margin.right,
            height = document.getElementById('bars--first').clientHeight - margin.top - margin.bottom;

        let chart1 = d3.select("#bars--first")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let chart2 = d3.select("#bars--second")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        let gruposConvivenciaMujeres = ['women-one_adult','women-couple_alone','women-couple_with_others','women-other_forms'];
        let gruposConvivenciaHombres = ['men-one_adult','men-couple_alone','men-couple_with_others','men-other_forms'];

        //Eje X
        let x = d3.scaleBand()
            .domain(d3.map(data, function(d){ return d.Periodo; }).keys())
            .range([0, width])
            .padding([0.2]);

        let xAxis = function(g) {
            g.call(d3.axisBottom(x).tickValues(x.domain().filter(function(d,i){ return !(i%4); })));            
            g.call(function(g){g.selectAll('.tick line').remove()});
            g.call(function(g){g.select('.domain').remove()});
        }
        
        chart1.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        chart2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        //Eje Y
        let y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        let yAxis = function(g) {
            g.call(d3.axisLeft(y).ticks(5));
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 0) {
                        return 'line-special';
                    }
                })
                .attr('x1', '0')
                .attr('x2', `${width}`);
        }

        chart1.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        chart2.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        //Colores
        let colorMujeres = d3.scaleOrdinal()
            .domain(gruposConvivenciaMujeres)
            .range([COLOR_PRIMARY_1, COLOR_ANAG_PRIM_1, COLOR_ANAG_PRIM_3, COLOR_GREY_1]);

        let colorHombres = d3.scaleOrdinal()
            .domain(gruposConvivenciaHombres)
            .range([COLOR_PRIMARY_1, COLOR_ANAG_PRIM_1, COLOR_ANAG_PRIM_3, COLOR_GREY_1]);
            
        //Datos stacked
        let dataStackedWomen = d3.stack()
            .keys(gruposConvivenciaMujeres)
            (data);

        let dataStackedMen = d3.stack()
            .keys(gruposConvivenciaHombres)
            (data);

        function init() {
            chart1.append("g")
                .attr('class','chart-g-1')
                .selectAll("g")
                .data(dataStackedWomen)
                .enter()
                .append("g")
                .attr("fill", function(d) { return colorMujeres(d.key); })
                .attr('class', function(d) {
                    return 'rect-padre-1 ' + d.key;
                })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                .attr('class','rect-1')
                .attr("x", function(d) { return x(d.data.Periodo); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .on('mouseover', function(d,i,e) {
                    //Opacidad de las barras
                    let current = this.parentNode.classList[1];
                    let other_1 = chart1.selectAll('.rect-1');
                    let other_2 = chart2.selectAll('.rect-2');
                    let _this_1 = chart1.selectAll(`.women-${current.split('-')[1]}`); //Elemento padre
                    let _thisChilds_1 = _this_1.selectAll('.rect-1');
                    let _this_2 = chart2.selectAll(`.men-${current.split('-')[1]}`); //Elemento padre
                    let _thisChilds_2 = _this_2.selectAll('.rect-2');
                    
                    other_1.each(function() {
                        this.style.opacity = '0.2';
                    });
                    other_2.each(function() {
                        this.style.opacity = '0.2';
                    });

                    _thisChilds_1.each(function() {
                        this.style.opacity = '1';
                    });
                    _thisChilds_2.each(function() {
                        this.style.opacity = '1';
                    });

                    //Texto                    
                    let html = '<p class="chart__tooltip--title">Tipo de convivencia: ' + dictionary[current.split('-')[1]] + '</p>' + 
                        '<p class="chart__tooltip--text">El <b>' + numberWithCommas3(parseFloat(d.data[current]).toFixed(1)) + '%</b> de las mujeres con 65 o más años vivían bajo esta forma de convivencia en ' + d.data.Periodo + '</p>';
            
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let bars_1 = chart1.selectAll('.rect-1');
                    let bars_2 = chart2.selectAll('.rect-2');
                    bars_1.each(function() {
                        this.style.opacity = '1';
                    });
                    bars_2.each(function() {
                        this.style.opacity = '1';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });
            
            chart2.append("g")
                .attr('class','chart-g-2')
                .selectAll("g")
                .data(dataStackedMen)
                .enter()
                .append("g")
                .attr("fill", function(d) { return colorHombres(d.key); })
                .attr('class', function(d) {
                    return 'rect-padre-2 ' + d.key;
                })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                .attr('class','rect-2')
                .attr("x", function(d) { return x(d.data.Periodo); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .on('mouseover', function(d,i,e) {
                    //Opacidad de las barras
                    let current = this.parentNode.classList[1];
                    let other_1 = chart1.selectAll('.rect-1');
                    let other_2 = chart2.selectAll('.rect-2');
                    let _this_1 = chart1.selectAll(`.women-${current.split('-')[1]}`); //Elemento padre
                    let _thisChilds_1 = _this_1.selectAll('.rect-1');
                    let _this_2 = chart2.selectAll(`.men-${current.split('-')[1]}`); //Elemento padre
                    let _thisChilds_2 = _this_2.selectAll('.rect-2');
                    
                    other_1.each(function() {
                        this.style.opacity = '0.2';
                    });
                    other_2.each(function() {
                        this.style.opacity = '0.2';
                    });

                    _thisChilds_1.each(function() {
                        this.style.opacity = '1';
                    });
                    _thisChilds_2.each(function() {
                        this.style.opacity = '1';
                    });

                    //Texto                    
                    let html = '<p class="chart__tooltip--title">Tipo de convivencia: ' + dictionary[current.split('-')[1]] + '</p>' + 
                        '<p class="chart__tooltip--text">El <b>' + numberWithCommas3(parseFloat(d.data[current]).toFixed(1)) + '%</b> de los hombres con 65 o más años vivían bajo esta forma de convivencia en ' + d.data.Periodo + '</p>';
            
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let bars_1 = chart1.selectAll('.rect-1');
                    let bars_2 = chart2.selectAll('.rect-2');
                    bars_1.each(function() {
                        this.style.opacity = '1';
                    });
                    bars_2.each(function() {
                        this.style.opacity = '1';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });
        }

        function animateChart() {
            chart1.selectAll('.rect-1')
                .attr("x", function(d) { return x(d.data.Periodo); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });
            
            chart2.selectAll('.rect-2')
                .attr("x", function(d) { return x(d.data.Periodo); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });
        }

        /////
        /////
        // Resto - Chart
        /////
        /////
        init();

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            animateChart();

            setTimeout(() => {
                setChartCanvas();
            }, 4000);
        });

        /////
        /////
        // Resto
        /////
        /////

        //Iframe
        setFixedIframeUrl('informe_perfil_mayores_2022_social_4_1','formas_convivencia_mayores');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('formas_convivencia_mayores');

        //Captura de pantalla de la visualización
        setTimeout(() => {
            setChartCanvas();
        }, 4000);

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('formas_convivencia_mayores');
        });

        //Altura del frame
        setChartHeight();
    });

        
}