import React, { Component } from 'react'
import PropTypes from 'prop-types'
import sortBy from 'lodash/sortBy'
import { ModalStateContext } from './modalStateContext'
import {
  PROMPT,
  SIDEBAR,
  INITIAL,
  DETAILS,
  LIST,
  ERROR_NOT_FOUND,
  SEARCHING,
  GEOLOCATION_SEARCHING,
} from './constants'
import { getExternalPickupPoints, getAvailablePickup } from './fetchers'
import { getPickupOptions, getUniquePickupPoints } from './utils/pickupUtils'
import { getPickupSlaString } from './utils/GetString'
import { getBestPickupPoints } from './utils/bestPickups'

class ModalState extends Component {
  constructor(props) {
    super(props)

    this.state = {
      askForGeolocation: props.askForGeolocation,
      activeState: this.getInitialActiveState(props),
      bestPickupOptions: getBestPickupPoints(
        props.pickupOptions,
        props.items,
        props.logisticsInfo
      ),
      activeSidebarState: this.getInitialActiveSidebarState(props),
      externalPickupPoints: [],
      geolocationStatus: PROMPT,
      lastState: '',
      lastSidebarState: '',
      lastMapCenterLatLng: null,
      isSearching: props.isSearching,
      localSearching: false,
      logisticsInfo: props.logisticsInfo,
      pickupPoints: props.pickupPoints,
      pickupOptions: props.pickupOptions,
      searchedAreaNoPickups: false,
      selectedPickupPoint: props.selectedPickupPoint,
      shouldSearchArea: false,
    }
  }

  componentDidMount() {
    const thisAddressCoords =
      this.props.address &&
      this.props.address.geoCoordinates &&
      this.props.address.geoCoordinates.value

    getExternalPickupPoints(thisAddressCoords).then(data =>
      this.setState({
        externalPickupPoints: data.items,
      })
    )
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      address,
      pickupPoints,
      items,
      logisticsInfo,
      pickupOptions,
      isSearching,
    } = this.props
    const {
      activeState,
      activeSidebarState,
      askForGeolocation,
      selectedPickupPoint,
    } = this.state

    const thisAddressCoords =
      address && address.geoCoordinates && address.geoCoordinates.value
    const prevAddressCoords = prevProps.address.geoCoordinates.value

    const thisPickupOptions = getPickupSlaString(pickupOptions)
    const prevPickupOptions = getPickupSlaString(prevProps.pickupOptions)

    const prevIsSearching = prevProps.isSearching
    const prevActiveSidebarState = prevState.activeSidebarState

    if (
      this.state.localSearching &&
      this.isCurrentState(SEARCHING, activeSidebarState)
    ) {
      return
    }

    if (
      prevActiveSidebarState !== activeSidebarState &&
      activeSidebarState === ERROR_NOT_FOUND
    ) {
      this.setState({ searchedAreaNoPickups: true })
    }

    if (isSearching !== prevIsSearching) {
      this.setState({ isSearching })
    }

    if (thisPickupOptions !== prevPickupOptions) {
      this.setState({
        pickupOptions: pickupOptions,
        pickupPoints: pickupPoints,
        searchedAreaNoPickups: thisPickupOptions.length === 0,
        bestPickupOptions: getBestPickupPoints(
          pickupOptions,
          items,
          logisticsInfo
        ),
      })
    }

    if (this.isDifferentGeoCoords(thisAddressCoords, prevAddressCoords)) {
      getExternalPickupPoints(thisAddressCoords).then(data =>
        this.setState({ externalPickupPoints: data.items })
      )
    }

    const hasPickups = pickupOptions.length > 0

    const isDetailsNoSelectedPickupPoint =
      this.isCurrentState(DETAILS, activeSidebarState) && !selectedPickupPoint

    const isSidebarState =
      !isSearching &&
      hasPickups &&
      this.isCurrentState(SEARCHING, activeState) &&
      !this.isCurrentState(SIDEBAR, activeState)

    const isListState =
      !isSearching &&
      hasPickups &&
      !this.isCurrentState(LIST, activeSidebarState) &&
      !this.isCurrentState(DETAILS, activeSidebarState) &&
      this.isCurrentState(SIDEBAR, activeState)

    const isSearchingState =
      this.state.isSearching &&
      !this.isCurrentState(SEARCHING, activeState) &&
      !this.isCurrentState(SIDEBAR, activeState) &&
      !this.isCurrentState(SEARCHING, activeSidebarState)

    const isLocalSearchingState =
      this.state.localSearching &&
      !this.isCurrentState(SEARCHING, activeSidebarState)

    const isGeolocationSearchingState =
      askForGeolocation &&
      !this.isCurrentState(SIDEBAR, activeState) &&
      !this.isCurrentState(GEOLOCATION_SEARCHING, activeState)

    const isErrorNopickupsState =
      !isSearching &&
      !hasPickups &&
      !this.isCurrentState(INITIAL, activeState) &&
      !this.isCurrentState(ERROR_NOT_FOUND, activeState) &&
      !this.isCurrentState(ERROR_NOT_FOUND, activeSidebarState)

    switch (true) {
      case isLocalSearchingState:
        this.setActiveSidebarState(SEARCHING)
        return

      case isSearchingState:
        if (this.isCurrentState(SIDEBAR, activeState)) {
          this.setActiveSidebarState(SEARCHING)
        } else {
          this.setActiveState(SEARCHING)
        }
        return

      case isListState:
        this.setActiveSidebarState(LIST)
        return

      case isGeolocationSearchingState:
        this.setActiveState(GEOLOCATION_SEARCHING)
        this.setActiveSidebarState(LIST)
        return

      case isDetailsNoSelectedPickupPoint:
      case isSidebarState:
        this.setActiveState(SIDEBAR)
        this.setActiveSidebarState(LIST)
        return

      case isErrorNopickupsState:
        if (activeState === SIDEBAR) {
          this.setActiveSidebarState(ERROR_NOT_FOUND)
        } else {
          this.setActiveState(ERROR_NOT_FOUND)
        }
        return

      default:
        return
    }
  }

  getInitialActiveState = props => {
    if (props.askForGeolocation) {
      return GEOLOCATION_SEARCHING
    }

    if (props.selectedPickupPoint || props.pickupOptions.length > 0) {
      return SIDEBAR
    }

    return INITIAL
  }

  getInitialActiveSidebarState = props => {
    if (props.askForGeolocation) {
      return GEOLOCATION_SEARCHING
    }

    if (props.selectedPickupPoint) {
      return DETAILS
    }

    return LIST
  }

  isDifferentGeoCoords(a, b) {
    return a[0] !== b[0] || a[1] !== b[1]
  }

  isCurrentState(state, activeState) {
    return state === activeState
  }

  setMapCenterLatLng = lastMapCenterLatLng =>
    this.setState({ lastMapCenterLatLng })

  setAskForGeolocation = askForGeolocation =>
    this.setState({ askForGeolocation })

  setShouldSearchArea = shouldSearchArea =>
    this.setState({
      shouldSearchArea,
      searchedAreaNoPickups:
        shouldSearchArea && this.state.searchedAreaNoPickups
          ? false
          : this.state.searchedAreaNoPickups,
    })

  setGeolocationStatus = status => this.setState({ geolocationStatus: status })

  setActiveState = state =>
    this.setState({
      lastState: this.state.activeState,
      activeState: state,
      searchedAreaNoPickups: false,
    })

  setActiveSidebarState = state => {
    this.setState({
      lastSidebarState: this.state.activeSidebarState,
      activeSidebarState: state,
      searchedAreaNoPickups: false,
    })
  }

  findSla = (li, pickupPoint) => {
    return li.slas.find(simulationPickupPoint =>
      simulationPickupPoint.id.includes(
        pickupPoint && (pickupPoint.id || pickupPoint.pickupPointId)
      )
    )
  }

  setSelectedPickupPoint = pickupPoint => {
    const { orderFormId, salesChannel } = this.props
    const {
      bestPickupOptions,
      pickupPoints,
      pickupOptions,
      logisticsInfo,
    } = this.state

    const pickupAddress = pickupPoint.pickupStoreInfo
      ? pickupPoint.pickupStoreInfo.address
      : pickupPoint.address

    if (pickupPoint.pickupStoreInfo) {
      this.setState({
        selectedPickupPoint: pickupPoint,
        activeSidebarState: DETAILS,
      })
      return
    }

    this.setActiveSidebarState(SEARCHING)
    this.setState({ localSearching: true })

    getAvailablePickup({
      logisticsInfo,
      salesChannel,
      orderFormId,
      pickupAddress,
    })
      .then(data => {
        const availablePickupOptions =
          data.logisticsInfo && getPickupOptions(data.logisticsInfo)
        const availablePickupPoints = data.pickupPoints
        const availablePickupLI =
          data.logisticsInfo &&
          data.logisticsInfo.find(li => this.findSla(li, pickupPoint))
        const availablePickupSLA =
          availablePickupLI && this.findSla(availablePickupLI, pickupPoint)

        const availablePickupOptionsWithoutDistance = availablePickupOptions.map(
          option => ({
            ...option,
            pickupDistance: null,
          })
        )
        const availablePickupPointsWithoutDistance = availablePickupPoints.map(
          option => ({
            ...option,
            distance: null,
          })
        )

        const newPickupOptions = getUniquePickupPoints(
          pickupOptions,
          availablePickupOptionsWithoutDistance
        )

        const newBestPickupOptions = getUniquePickupPoints(
          bestPickupOptions,
          availablePickupOptionsWithoutDistance
        )

        const newPickupPoints = getUniquePickupPoints(
          pickupPoints,
          availablePickupPointsWithoutDistance
        )

        const newLogisticsInfo = logisticsInfo.map((li, index) => ({
          ...li,
          slas: [
            ...li.slas,
            ...(data.logisticsInfo ? [...data.logisticsInfo[index].slas] : []),
          ],
        }))

        this.setState(
          {
            selectedPickupPoint: availablePickupSLA || pickupPoint,
            pickupPoints: sortBy(newPickupPoints, 'distance'),
            pickupOptions: sortBy(newPickupOptions, 'pickupDistance'),
            bestPickupOptions: newBestPickupOptions,
            logisticsInfo: newLogisticsInfo,
            localSearching: false,
          },
          () => this.setActiveSidebarState(DETAILS)
        )
      })
      .catch(error => {
        this.setState(
          {
            selectedPickupPoint: pickupPoint,
            localSearching: false,
          },
          () => this.setActiveSidebarState(DETAILS)
        )
      })
  }

  render() {
    const { children } = this.props
    const {
      activeState,
      activeSidebarState,
      bestPickupOptions,
      externalPickupPoints,
      geolocationStatus,
      isSearching,
      lastState,
      lastSidebarState,
      lastMapCenterLatLng,
      logisticsInfo,
      pickupOptions,
      pickupPoints,
      searchedAreaNoPickups,
      selectedPickupPoint,
      shouldSearchArea,
    } = this.state

    return (
      <ModalStateContext.Provider
        value={{
          activeState,
          activeSidebarState,
          bestPickupOptions,
          externalPickupPoints,
          geolocationStatus,
          isSearching,
          lastState,
          lastSidebarState,
          lastMapCenterLatLng,
          logisticsInfo,
          pickupOptions,
          pickupPoints,
          searchedAreaNoPickups,
          selectedPickupPoint,
          setActiveState: this.setActiveState,
          setAskForGeolocation: this.setAskForGeolocation,
          setActiveSidebarState: this.setActiveSidebarState,
          setGeolocationStatus: this.setGeolocationStatus,
          setMapCenterLatLng: this.setMapCenterLatLng,
          setSelectedPickupPoint: this.setSelectedPickupPoint,
          shouldSearchArea,
          setShouldSearchArea: this.setShouldSearchArea,
        }}>
        {children}
      </ModalStateContext.Provider>
    )
  }
}

ModalState.propTypes = {
  children: PropTypes.any.isRequired,
}

export default ModalState
