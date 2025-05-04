import { useSelector } from "react-redux"

const usePage = () => useSelector(store => store.page)
 
export default usePage