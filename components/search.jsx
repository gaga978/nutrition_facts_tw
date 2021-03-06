import React from 'react'
import { Link } from 'react-router'
import jsonQuery from 'json-query'
require('round10').polyfill()
// children compoents
import SearchSorting from './search_sorting.jsx'

const SearchIconNote = function(props) {
  return (
    <span className="search_icon_note">
      <span className={`search_icon_note__icon background_${props.name}`}></span>
      <span className="search_icon_note__value">{props.value}</span>
    </span>
  )
}

export default class Search extends React.Component {
  render() {
    var results = null
    if (this.props.foodModel && this.props.params.keyword) {
      var keyword = this.props.params.keyword
      results = jsonQuery(
        `foods[**][*:contains(${keyword})]`,
        {
          data: {foods: this.props.foodModel.all()},
          locals:{
            contains: function(input,keyword) {
              if ((input.name + input.nickName + input.enName + input.contents).toLowerCase().indexOf(keyword.toLowerCase()) >= 0)
                return input
            }
          }
        }
      ).value
    }
    return (
      <main>

        <div className="search_bar">
          <form id="searchForm" onSubmit={(event)=> {
            event.preventDefault()
            var keywordNode = event.target.keyword
            this.context.router.push(`${this.context.router.routes[0].path}/search/${keywordNode.value}`)
            keywordNode.blur()
          }}>
            搜尋：
            <input type="text" name="keyword" className="nude_input_text" defaultValue={this.props.params.keyword} placeholder="請輸入食物名稱" />
          </form>
        </div>

        <div className="search_icon_notes">
          {[['protein','蛋白質'],['fat','脂肪'],['carb','碳水化合物'],['fiber','膳食纖維']].
            map((item)=> <SearchIconNote key={item[0]} name={item[0]} value={item[1]} />)}
        </div>

        <ul>
          {(results == null) ?
            [] : (
              (results.length == 0) ?
                <li style={{padding:'40px', textAlign:'center'}}>{`很抱歉，這裡沒有「${this.props.params.keyword}」的資料`}</li> :
                results.map((result)=> { return <li key={result.uniNumber}><Result result={result} rootPath={this.context.router.routes[0].path}/></li> })
            )
          }
        </ul>

      </main>
    )
  }
}
Search.contextTypes = {
  router: React.PropTypes.object.isRequired
}

class Result extends React.Component {
  render() {
    var result = this.props.result
    var rootPath = this.props.rootPath
    return (
      <div className="result">
        <Link to={`${rootPath}/foods/${result.uniNumber}`} className="nude_link result__link">
          <div className="result__title">
            <span className="result__title__name">{result.name}</span>
            <span className="style__inline-block">
              <span className="result__title__note">100g</span>
              <span className="result__title__note">{Math.round10(result.nutritionItems.get('熱量').amountPer100g, -1)}大卡</span>
            </span>
          </div>

          <div span className="result__items">

            <span className="result__item">
              <span className="result__item__icon"><span className="nutrition_icon_protein"></span></span>
              <span className="result__item__value">{Math.round10(result.nutritionItems.get('粗蛋白').amountPer100g, -1)}<font className="result__unit">g</font></span>
            </span>

            <span className="result__items__separator">:</span>

            <span className="result__item">
              <span className="result__item__icon"><span className="nutrition_icon_fat"></span></span>
              <span className="result__item__value">{Math.round10(result.nutritionItems.get('粗脂肪').amountPer100g, -1)}<font className="result__unit">g</font></span>
            </span>

            <span className="result__items__separator">:</span>

            <span className="result__item">
              <span className="result__item__icon"><span className="nutrition_icon_carb"></span></span>
              <span className="result__item__value">
                {Math.round10(result.nutritionItems.get('總碳水化合物').amountPer100g, -1)}<font className="result__unit">g</font>
              </span>

              {((fiberAmount)=> {
                if (fiberAmount > 0) return (
                  <span className="result__item__note">
                    (<span className="result__item__note__icon"><span className="nutrition_icon_fiber"></span></span>{fiberAmount}<font className="result__unit">g</font>)
                  </span>
                )
              })(Math.round10(result.nutritionItems.get('膳食纖維').amountPer100g, -1))}
            </span>

          </div>
        </Link>
      </div>
    )
  }
}
