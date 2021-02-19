# ViewBovine
ViewBovine is a Web Portal for exploring WGS data of M.bovis, linking genetic relatedness with geographical neighbourhood for understanding bTB transmission.

![Cover of ViewBovine](https://github.com/misssoft/Fan.Flask/raw/master/cover.png)

# Prerequisites
    pip3 install -r requirements

# Install and Run
    git clone https://github.com/oxfordfun/ViewBovine
    cd ViewBovine
    APP_SETTINGS='config.SwanseaProductionConfig' python3 main.py
    
# Technology Stack
1. [Python Flask](http://flask.pocoo.org/)
2. [Leaflet](https://leafletjs.com/) for Map View 
3. GeoTools for [WGS84-OSGB36 conversions](https://www.nearby.org.uk/tests/GeoTools2.html)
4. Map data: [OpenStreetMap](https://www.openstreetmap.org/) and [MapBox](https://www.mapbox.com/)
5. Tree presentation: [Phylotree Javascript library](http://phylotree.hyphy.org/documentation/index.html)
6. Tree building: [iqtree](http://www.iqtree.org/) 

# Functions

1. Search a sample and show the related herd on the map 
2. Show sample related cattle movements on the map
3. Search genetic neighbourhood of a sample and show all herds on the map
4. Cohabitation records of a genetic neighbourhood
5. Phylogeny tree of a sample in a 3-snp cluster
6. Quality data of a sample (reads coverage and ACGT percentage)
7. Within herd SNP Distance Matrix 
8. Cluster all sample based on their genetic distance and show them on the map
9. View sub-cluster within a cluster on the map
10. Interesting score: sample pairs that are far apart in miles but close in genetic SNPs.

