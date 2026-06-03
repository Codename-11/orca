import { StyleSheet } from 'react-native'

import { mobileHomeStyleSection1 } from './mobile-home-style-section-1'
import { mobileHomeStyleSection2 } from './mobile-home-style-section-2'

export const styles = StyleSheet.create({
  ...mobileHomeStyleSection1,
  ...mobileHomeStyleSection2
})
