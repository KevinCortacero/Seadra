
<!-- Template   -->
<template>
  <v-card>
    <v-combobox style="margin-top:30px" v-for="(choice,i) in this.data.choices" :key="'choice'+i"
            v-model="choice_select[choice.name]"
            v-bind:items= "choice.options"
            v-bind:label="choice.name"
            outlined
            dense
          >
    </v-combobox>
    <v-combobox v-for="(check,i) in this.data.checks" :key="'check'+i"
            v-model="check_select[check.name]"
            v-bind:items= "check.options"
            v-bind:label="check.name"
            multiple
            outlined
            dense
          >
    </v-combobox>
    <v-textarea v-for="(text,i) in this.data.texts" :key="'text'+i" v-model=text_select[text.name] class="mx-2" v-bind:label="text.name" v-bind:rows="text.size" prepend-icon="mdi-comment"></v-textarea>
  </v-card>
</template>





<!-- Script   -->
<script>

    export default {
        
        data() {
            return {
                choice_select: {},
                check_select: {},
                text_select: {},
            }
        },
        props:{
            data:{type:Object},
            getAnnotation: {type:Function}
        },
        watch:{
            data(){
                this.choice_select = {}
                for (let i=0; i<this.data.choices.length; i++) {
                    this.choice_select[this.data.choices[i].name] = ""
                }
                this.check_select = {}
                for (let i=0; i<this.data.checks.length; i++) {
                    this.check_select[this.data.checks[i].name] = ""
                }
                this.text_select = {}
                for (let i=0; i<this.data.texts.length; i++) {
                    this.text_select[this.data.texts[i].name] = ""
                }    
            }
        },
        methods: {
        },
        mounted() {
            this.$emit('update:getAnnotation', () => {return [this.choice_select, this.check_select, this.text_select]})
        }
    }

</script>



