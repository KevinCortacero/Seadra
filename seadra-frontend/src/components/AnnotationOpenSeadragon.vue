<template>
    <v-card flat>
        <v-card-text>
        <v-row>
            <v-btn-toggle v-model="selected_tool" shaped color="primary">
                <v-btn :value="'fabric-move'">
                    <v-icon>mdi-drag-variant</v-icon>
                </v-btn>
                <v-btn :value="'fabric-rect'">
                    <v-icon>mdi-shape-rectangle-plus</v-icon>
                </v-btn>
                <v-btn :value="'fabric-polygon'">
                    <v-icon>mdi-vector-polygon</v-icon>
                </v-btn>
                <v-btn v-if="boxSelected" :value="'delete'">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn v-if="boxSelected" :value="'send-front'">
                    <v-icon>mdi-arrange-bring-forward</v-icon>
                </v-btn>
                <v-btn v-if="boxSelected" :value="'send-back'">
                    <v-icon>mdi-arrange-send-backward</v-icon>
                </v-btn>
            </v-btn-toggle>
        </v-row>
        </v-card-text>
  </v-card>
</template>

<script>
    import { mapState,mapGetters } from 'vuex';
    import LabelTool from '../js/label-tool'

    export default {
        data: () => ({ 
            selected_tool: undefined,
            labelBoxes: {},
            boxSelected: false,
        }),
        computed: {
            ...mapState(['viewerOSD']),
            ...mapGetters(['selected_label']),
        },
        watch: {
            // whenever question changes, this function will run
            
            selected_tool(newSlected, oldSelected) {
                console.log(newSlected,oldSelected);
                /* $('#label-box-select').click((e) => {
                        this.viewModeOn();
                    });*/
                if(this.labelTool){
                    if(newSlected==="fabric-move"){
                        this.labelTool.editModeOn();
                    } else if(newSlected==="fabric-rect"){
                        this.labelTool.drawModeOn(true)
                    } else if(newSlected==="fabric-polygon") {
                        this.labelTool.drawModeOn(false)
                    } else if(newSlected==="delete"){
                        this.labelTool.removeSelected();
                        this.selected_tool="fabric-move"
                    } else if(newSlected==="send-front"){
                        this.labelTool.bringToFront();
                        this.selected_tool="fabric-move"
                    } else if(newSlected==="send-back"){
                        this.labelTool.sendToBack();
                        this.selected_tool="fabric-move"
                    }
                }
            },
            selected_label(n){
                if(this.labelTool) this.labelTool.changeLabel(n)
            },
            viewerOSD(newOSD){
                if(!this.labelTool){
                    this.labelTool = new LabelTool()
                    this.labelTool.init(newOSD,(isSelected)=>this.boxSelected=isSelected)
                    this.labelTool.changeLabel(this.selected_label)
                    this.initEventKeyboard()
                    this.$store.commit('INIT_GETTER_BOXLABELS', ()=>{return this.labelTool.saveLabelBoxes()})
                    window.addEventListener('resize', ()=>this.labelTool.resize());
                }
            }
        },
        methods: {
            initEventKeyboard(){
                document.onkeydown = (e)=> {
                    if (e.key === 'Delete') {
                        this.labelTool.removeSelected();
                    }
                    else if (e.key === 'e') {
                        this.labelTool.drawModeOn(true);
                    }
                    else if (e.key === 'r') {
                        this.labelTool.drawModeOn(false);
                    }
                    else if (e.key === 'q') {
                        if(!this.labelTool.drawing)
                            this.labelTool.viewModeOn();
                    }
                    //disable osdviewer slide flip
                    else if(e.key === 'f') {
                        return false;
                    }
                    else if(e.key === 's') {
                        if(e.ctrlKey)
                            this.labelTool.saveLabelBoxes()
                    }
                };
            },
            getValue(){
                console.log(this.labelTool.saveLabelBoxes())
            }
        },
        mounted() {
        },
        unmounted() {
            window.removeEventListener('resize', this.labelTool.resize);
        },
  }
</script>
