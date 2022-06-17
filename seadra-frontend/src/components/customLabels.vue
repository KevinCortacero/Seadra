
<!-- Template   -->
<template>
  <v-card style="border-radius:0px">
    <v-combobox v-for="(choice,i) in this.template.choices" :key="'choice'+i"
            v-model="dataAnnotations[choice.name]"
            v-bind:items= "choice.options"
            v-bind:label="choice.name"
            outlined
            dense
            @change="changeDetect"
          >
    </v-combobox>
    <v-combobox v-for="(check,i) in this.template.checks" :key="'check'+i"
            v-model="dataAnnotations[check.name]"
            v-bind:items= "check.options"
            v-bind:label="check.name"
            multiple
            outlined
            dense
            @change="changeDetect"
          >
    </v-combobox>
    <v-text-field v-for="(text,i) in this.template.textfield" :key="'text'+i" v-model=dataAnnotations[text] class="mx-2" v-bind:label="text" @change="changeDetect"></v-text-field>
    <v-textarea v-model=dataAnnotations.comment class="mx-2" label="comment" rows="4" prepend-icon="mdi-comment" @change="changeDetect"></v-textarea>
  </v-card>
</template>





<!-- Script   -->
<script>

    export default {
        
        data() {
            return {

            }
        },
        props:{
            template:{type:Object},
            annotations: {type:Object},
            stateSave: {type:Boolean},
        },
        computed: {
            dataAnnotations: {
                get () { return this.annotations },
                set (annotations) { this.$emit('update:annotations', annotations) },
            },
        },
        watch:{
            template(){
                this.resetField()
            },
            annotations(){
                if(Object.keys(this.annotations).length === 0) this.resetField()
            }
        },
        methods: {
            resetField(){
                let annotations = {}
                for (let i=0; i<this.template.choices.length; i++) {
                    annotations[this.template.choices[i].name] = ""
                }
                for (let i=0; i<this.template.checks.length; i++) {
                    annotations[this.template.checks[i].name] = ""
                }
                for (let i=0; i<this.template.textfield.length; i++) {
                    annotations[this.template.textfield[i]] = ""
                }
                annotations.comment=''
                this.dataAnnotations = annotations
                this.$emit('update:stateSave',false)
            },
            changeDetect(){
                this.$emit('update:stateSave',true)
            }
        },
        mounted() {

        }
    }

</script>



