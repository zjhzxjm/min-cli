/**
 * get indent of a mutiple lines string
 * return {length: 4, char: ' '}
 */
export function getIndent (str: string) {
  let arr = str.split('\n')
  while (arr.length && !/\w/.test(arr[0])) { // if the first line is empty line, then get rid of it
    arr.shift()
  }
  let indent = { firstLineIndent: 0, indent: 0, char: '' }
  let s = arr[0]
  let i = 0
  if (s.charCodeAt(0) === 32 || s.charCodeAt(0) === 9) { // 32 is space, 9 is tab
    indent.char = s[0]
  }
  while (s[i] === indent.char) {
    i++
  }
  indent.firstLineIndent = i
  if (!arr[1]) {
    return indent
  }

  s = arr[1], i = 0
  if (!indent.char) {
    if (s.charCodeAt(0) === 32 || s.charCodeAt(0) === 9) { // 32 is space, 9 is tab
      indent.char = s[0]
    }
  }
  while (s[i] === indent.char) {
    i++
  }
  indent.indent = i - indent.firstLineIndent
  return indent
}

/**
 * Fix indent for a mutiple lines string
 * @param  {String} str  string to fix
 * @param  {Number} num  4 means add 4 chars to each line, -4 means remove 4 chars for each line
 * @param  {String} char space or tab, indent charactor
 * @return {String}      fixed indent string
 */
export function fixIndent (str: string, num: number, char: string) {
  if (char === undefined) {
    let indent = getIndent(str)
    char = indent.char
  }
  let arr = str.split('\n')
  if (num > 0) { // added char to each line
    arr.forEach(function (v, i) {
      let p = 0
      while (p++ < num) {
        arr[i] = char + arr[i]
      }
    })
  }
  else { // remove char for each line
    arr.forEach(function (v, i) {
      arr[i] = arr[i].substr(-1 * num)
    })
  }
  return arr.join('\n')
}
