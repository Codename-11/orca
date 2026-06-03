import { StyleSheet } from 'react-native'

import { mobileTaskRouteStyleSection1 } from './mobile-task-route-style-section-1'
import { mobileTaskRouteStyleSection2 } from './mobile-task-route-style-section-2'
import { mobileTaskRouteStyleSection3 } from './mobile-task-route-style-section-3'
import { mobileTaskRouteStyleSection4 } from './mobile-task-route-style-section-4'
import { mobileTaskRouteStyleSection5 } from './mobile-task-route-style-section-5'
import { mobileTaskRouteStyleSection6 } from './mobile-task-route-style-section-6'

export const styles = StyleSheet.create({
  ...mobileTaskRouteStyleSection1,
  ...mobileTaskRouteStyleSection2,
  ...mobileTaskRouteStyleSection3,
  ...mobileTaskRouteStyleSection4,
  ...mobileTaskRouteStyleSection5,
  ...mobileTaskRouteStyleSection6
})
