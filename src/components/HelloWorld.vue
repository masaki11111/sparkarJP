<template>
  <div class="hello">
    <div id="message_board">
      <!-- 検索バー -->
      <div class="search_bar">
        <font-awesome-icon class="search_icon" icon="search" />
        <!-- 入力された文字列をv-modelでバインディング -->
        <input id="text2" type="text" placeholder="検索" v-model="keyword" />
      </div>

      <!-- axiosにてJSONデータを全て取得するまでローディングエフェクトを出しておく -->
      <div v-if="display_loading===false">
        <div class="loading-spacer"></div>
        <vue-loading type="spiningDubbles"></vue-loading>
      </div>

      <!-- スプレッドシートから取得したJSONデータをそれぞれ表示する -->
      <div class="flex-container">
        <div class="flex-item" v-for="(effect_list_splite,index) in effect_lists_splite" :key="index">
          <!--画像をクリックした時にその画像のindexをsendindexの引数として、モーダルを表示するときの配列の番号（num_modal）に渡す-->
          <img :src="effect_list_splite.img" @click="show(); sendindex(index)" class="button" />
          <div class="thumnail">
            <img :src="effect_list_splite.effect_icon" />
          </div>
          <div class="effect_name">
            <a :href="effect_list_splite.effect_link" target="_blank">{{ effect_list_splite.effect_name }}</a>
          </div>
          <div class="account_name">
            <a :href="effect_list_splite.account_link" target="_blank">作成:{{ effect_list_splite.account_link_name }}</a>
          </div>
        </div>
      </div>

      <!-- axiosでスプレッドシートのJSONを取得した後に（display_loading===true）無限ローディングとモーダルを表示 -->
      <div v-if="display_loading===true">
        <!-- 無限ローディング -->
        <infinite-loading ref="infiniteLoading" spinner="circle" @infinite="infiniteLoad()">
          <!-- ステータスがcompleteに更新されると下記が表示される -->
          <span slot="no-more">-----検索結果は以上です-----</span>
          <!-- 結果が存在しない場合下記が表示される -->
          <span slot="no-results">-----検索結果はありません-----</span>
        </infinite-loading>

        <!-- effect_lists_spliteの中身がないときにエラーを吐くので v-if -->
        <div v-if="Object.keys(effect_lists_splite).length !==　0">
          <!-- モーダル -->
          <modal
            name="modal_movie"
            width="80%"
            height="auto"
            :adaptive="true"
            :draggable="false"
            :resizable="false"
          >
            <div class="modal-body">
              <video
                :src="effect_lists_splite[num_modal].movie"
                controls
                autoplay
                playsinline
                loop
                style="width:90%"
              ></video>
            </div>
          </modal>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },

  data() {
    return {
      // webAPIのURL
      ssJsonUrl:
        "https://script.google.com/macros/s/AKfycbxNuAGrZfhbUnxIfm6etlCuQ5tgm-Pbeb19aWsCY6wfZCjTnldQyA1XPXUdkqhghjws7g/exec",
      effect_lists_all: [], // axiosで取得したデータの箱
      effect_lists_splite: [], //取得したデータを分割して表示するための箱
      // keys: null,
      // _show: true,
      display_loading: false,
      num_modal: 0, //モーダル表示するためのsendindex用の変数
      start: 0, //無限スクロール用
      end: 10, //無限スクロール用
      keyword: "" // 検索用（[]だとうまくいかない）
    };
  },

  computed: {
    // 検索バーに文字列を入れた時にeffect_lists_all内で引っかかる文字列を返す
    filteredEffect: function() {
      var effects = [];
      for (var i in this.effect_lists_all) {
        var effect = this.effect_lists_all[i];
        // console.log(
        //   "i:" + i + " this.effect_lists_all[i]:" + this.effect_lists_all[i] + " effect:" + effect
        // );
        if (
          //effect_name等が数字の場合はエラーになるためString型に変更
          String(effect.effect_name).indexOf(this.keyword) != -1 ||
          String(effect.account_name).indexOf(this.keyword) != -1
        ) {
          effects.push(effect);
        }
      }
      return effects;
    }
  },

  //keywordの文字列が変わったら改めて無限スクロールを開始してエフェクトを表示
  watch: {
    keyword(value) {
      this.effect_lists_splite = [];
      this.start = 0;
      this.end = 10;
      this.$refs.infiniteLoading.stateChanger.reset();
      this.infiniteLoad();
    }
  },

  methods: {
    // 無限スクロール、effect_lists_spliteがfilteredEffectと同じ長さになるまでstoreEffect()を呼ぶ
    infiniteLoad() {
      console.log(
        "infinite Object.keys(effect_lists_all).length:" + Object.keys(this.effect_lists_all).length
      );
      console.log(
        "infinite Object.keys(effect_lists_splite).length:" +
          Object.keys(this.effect_lists_splite).length
      );
      console.log(
        "infinite Object.keys(this.filteredEffect).length:" + Object.keys(this.filteredEffect).length
      );
      this.storeEffect();
      if (
        Object.keys(this.effect_lists_splite).length <
        Object.keys(this.filteredEffect).length
      ) {
        this.$refs.infiniteLoading.stateChanger.loaded();
      } else {
        this.$refs.infiniteLoading.stateChanger.complete();
      }
    },

    // effect_lists_spliteにfilteredEffect内の値を10個ずつ（startからendまで）格納する
    storeEffect() {
      if (Object.keys(this.filteredEffect).length != 0) {
        this.effect_lists_splite = this.effect_lists_splite.concat(
          this.filteredEffect.slice(this.start, this.end)
        );
      } else {
        this.effect_lists_splite = [];
        this.$refs.infiniteLoading.stateChanger.loaded();
      }
      this.start += 10;
      this.end += 10;
    },

    //モーダルを表示
    show(event) {
      this.$modal.show("modal_movie");
    },

    //モーダルを閉じる
    hide() {
      this.$modal.hide("modal_movie");
    },

    // indexをモーダル用の配列番号のnum_modalに入れる
    sendindex(index) {
      this.num_modal = index;
    }
  },

  created: function() {
    // スプレッドシートの値を取得
    this.axios
      .get(this.ssJsonUrl)
      .then(response => {
        this.effect_lists_all = response.data;
        console.log(
          "axios Object.keys(effect_lists_all).length:" + Object.keys(this.effect_lists_all).length
        );
        console.log(
          "axios Object.keys(effect_lists_splite).length:" +
            Object.keys(this.effect_lists_splite).length
        );
        console.log(
          "axios Object.keys(this.filteredEffect).length:" + Object.keys(this.filteredEffect).length
        );
        //ここでもstoreEffectを呼ぶ
        this.storeEffect();
        // trueにして無限スクロール、モダールを表示
        this.display_loading = true;
      })
      .catch(function(error) {
        console.log(error);
      });
  }
};
</script>


<style lang="scss" scoped>
/* 親要素(コンテナ) */
.search_bar {
  display: flex; /*アイコン、テキストボックスを調整する*/
  align-items: center; /*アイコン、テキストボックスを縦方向の中心に*/
  justify-content: center; /*アイコン、テキストボックスを横方向の中心に*/
  height: 2rem;
  width: 90%;
  background-color: #ddd;
  margin: 1rem 1rem;
  .search_icon {
    /*アイコンに一定のスペースを設ける*/
    height: 1rem;
    width: 1rem;
    margin: 0.2rem 0.4rem;
  }
  #text2 {
    font-size: 1rem;
    width: 100%; /*flexの中で100%広げる*/
    background-color: #ddd;
    border: none; /*枠線非表示*/
    outline: none; /*フォーカス時の枠線非表示*/
    box-sizing: border-box; /*横幅の解釈をpadding, borderまでとする*/
  }
}
vue-loading {
  color: #ddd;
  background-color: #ddd;
  width: 2rem;
  height: 2rem;
}
.flex-container {
  // background-color: red;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .flex-item {
    // background-color: blue;
    padding: 0em;
    // margin: 0.5% 0.5%;
    width: 49.75%;
    margin-bottom: 0.5%;
    position: relative;
    img {
      width: 100%;
    }
    .thumnail {
      position: absolute;
      width: 15%;
      height: auto;
      top: 75%;
      left: 5%;
    }
    .effect_name {
      position: absolute;
      top: 85%;
      left: 5%;
      z-index: 100;
      a {
        font-weight: bold;
        text-decoration: none;
        font-size: 0.7rem;
        color: white;
      }
    }
    .account_name {
      position: absolute;
      top: 90%;
      left: 5%;
      z-index: 100;
      a {
        text-decoration: none;
        font-size: 0.7rem;
        color: white;
      }
    }
  }
}
</style>
