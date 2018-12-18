# ViewBovine
bTB Whole Genome Sequencing Application

![Cover of ViewBovine](https://github.com/misssoft/Fan.Flask/raw/master/cover.png)

# Prerequisites
    apt install python3-flask python3-requests

# Install and Run
    git clone https://github.com/aphascience/bTBWGS.git
    cd bTBWGS
    python main.py
    
# Technology Stack
1. Python Flask (http://flask.pocoo.org/)
2. Leaflet for Map View (https://leafletjs.com/)
3. GeoTools for WGS84-OSGB36 conversions (https://www.nearby.org.uk/tests/GeoTools2.html)

# Functions

1. Search a sample and show the related herd on the map 
2. Show sample related cattle movements on the map
2. Search genetic neighbourhood of a sample and show all herds on the map
4. Cluster all sample based on their genetic distance and show them on the map
5. View sub-cluster within a cluster on the map

