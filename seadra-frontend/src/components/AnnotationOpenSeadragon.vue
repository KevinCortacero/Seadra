<template>
    <v-card flat class="py-12">
        <v-card-text>
        <v-row align="center" justify="center">
            <v-btn-toggle v-model="selected_tool" rounded color="primary">
            <v-btn :value="'fabric-rect'">
                <v-icon>mdi-shape-rectangle-plus</v-icon>
            </v-btn>
            <v-btn :value="'fabric-polygon'">
                <v-icon>mdi-vector-polygon</v-icon>
            </v-btn>
            <v-btn :value="'delete'">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn :value="'send-front'">
                <v-icon>mdi-arrange-bring-forward</v-icon>
            </v-btn>
            <v-btn :value="'send-back'">
                <v-icon>mdi-arrange-send-backward</v-icon>
            </v-btn>
            </v-btn-toggle>
        </v-row>
        </v-card-text>
  </v-card>
</template>

<script>
    import { mapState } from 'vuex';
    import LabelTool from '../js/label-tool'

    export default {
        data: () => ({ 
            selected_tool: undefined,
            selectedClass: {
                id: 0,
                name: 'TEST',
                color: '#c24246'
            },
            labelBoxes: {}
        }),
        computed: mapState(['viewerOSD']),
        watch: {
            // whenever question changes, this function will run
            
            selected_tool(newSlected, oldSelected) {
                console.log(newSlected,oldSelected);
                /* $('#label-box-select').click((e) => {
                        this.viewModeOn();
                    });*/
                if(newSlected==="fabric-rect"){
                    this.labelTool.drawModeOn(true)
                } else if(newSlected==="fabric-polygon") {
                    this.labelTool.drawModeOn(false)
                } else if(newSlected==="delete"){
                    this.labelTool.removeSelected();
                } else if(newSlected==="send-front"){
                    this.labelTool.bringToFront();
                } else if(newSlected==="send-back"){
                    this.labelTool.sendToBack();
                }
            },
            viewerOSD(newOSD){
                if(!this.labelTool){
                    this.labelTool = new LabelTool()
                    this.labelTool.init(newOSD)
                    window.addEventListener('resize', ()=>this.labelTool.resize());
                }
            }
        },
        methods: {
        },
        mounted() {

        },
        unmounted() {
            window.removeEventListener('resize', this.labelTool.resize);
        },
  }
</script>
