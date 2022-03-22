//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas2 } from '../helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage, setCustomCanvas, setChartCustomCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42', 
COLOR_ANAG_1 = '#D1834F', 
COLOR_ANAG_2 = '#BF2727', 
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0', 
COLOR_GREY_1 = '#B5ABA4', 
COLOR_GREY_2 = '#64605A', 
COLOR_OTHER_1 = '#B58753', 
COLOR_OTHER_2 = '#731854';

export function initChart(iframe) {
    //Desarrollo del gráfico
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_social_4_1/main/data/convivencia_mas65_eurostat.csv', function(error,data) {
        if (error) throw error;
        //Declaramos fuera las variables genéricas
        let margin = {top: 20, right: 20, bottom: 20, left: 35},
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

        let xAxis = d3.axisBottom(x)
            .tickValues(x.domain().filter(function(d,i){ return !(i%2)}));
        
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

        chart1.append("g")
            .attr("class", "yaxis")
            .call(d3.axisLeft(y));

        chart2.append("g")
            .attr("class", "yaxis")
            .call(d3.axisLeft(y));

        //Colores
        let colorMujeres = d3.scaleOrdinal()
            .domain(gruposConvivenciaMujeres)
            .range([COLOR_PRIMARY_1, COLOR_COMP_2, COLOR_COMP_1, COLOR_OTHER_1]);

        let colorHombres = d3.scaleOrdinal()
            .domain(gruposConvivenciaHombres)
            .range([COLOR_PRIMARY_1, COLOR_COMP_2, COLOR_COMP_1, COLOR_OTHER_1]);
            
        //Datos stacked
        let dataStackedWomen = d3.stack()
        .keys(gruposConvivenciaMujeres)
        (data);

        let dataStackedMen = d3.stack()
            .keys(gruposConvivenciaHombres)
            (data);

        console.log(dataStackedWomen);

        function init() {
            chart1.append("g")
                .attr('class','chart-g-1')
                .selectAll("g")
                .data(dataStackedWomen)
                .enter()
                .append("g")
                .attr("fill", function(d) { return colorMujeres(d.key); })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                    .attr('class','prueba-1')
                    .attr("x", function(d) { console.log(d); return x(d.data.Periodo); })
                    .attr("y", function(d) { return y(0); })
                    .attr("height", function(d) { return 0; })
                    .attr("width",x.bandwidth())
                    .transition()
                    .duration(2500)
                    .attr("y", function(d) { return y(d[1]); })
                    .attr("height", function(d) { return y(d[0]) - y(d[1]); });
            
            chart2.append("g")
                .attr('class','chart-g-1')
                .selectAll("g")
                .data(dataStackedMen)
                .enter()
                .append("g")
                .attr("fill", function(d) { return colorHombres(d.key); })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                    .attr('class','prueba-2')
                    .attr("x", function(d) { console.log(d); return x(d.data.Periodo); })
                    .attr("y", function(d) { return y(0); })
                    .attr("height", function(d) { return 0; })
                    .attr("width",x.bandwidth())
                    .transition()
                    .duration(2500)
                    .attr("y", function(d) { return y(d[1]); })
                    .attr("height", function(d) { return y(d[0]) - y(d[1]); });
        }

        function animateChart() {
            chart1.selectAll('.prueba-1')
                .attr("x", function(d) { console.log(d); return x(d.data.Periodo); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .transition()
                .duration(2500)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });
            
            chart2.selectAll('.prueba-2')
                .attr("x", function(d) { console.log(d); return x(d.data.Periodo); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .transition()
                .duration(2500)
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
        //setChartCanvas();
        setTimeout(() => {
            setCustomCanvas();
        }, 5000);

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            //setChartCanvasImage('formas_convivencia_mayores');
            setChartCustomCanvasImage('formas_convivencia_mayores');
        });

        //Altura del frame
        setChartHeight(iframe);
    });

        
}