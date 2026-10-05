import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'

export type SelectOption = {
  label: string
  value: string
}

export type SelectProps = {
  options: SelectOption[]
  placeholder?: string
  value?: string
  onChange?: (option: SelectOption) => void
  defaultValue?: string
  isDisabled?: boolean
}

const Select = (props: SelectProps) => {
  const {
    options,
    placeholder,
    value: controlledValue,
    onChange,
    defaultValue,
    isDisabled = false,
  } = props

  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  )
  const [isFocus, setIsFocus] = useState(false)

  const isControlled = `value` in props

  const value = isControlled ? controlledValue : internalValue

  const handleChange = (item: { label: string; value: string }) => {
    setIsFocus(false)
    if (!isControlled) {
      setInternalValue(item.value)
    }
    onChange?.(item)
  }

  // Determine icon color based on state
  const iconColor = isDisabled
    ? '#a4acb9' // Greyscale/300
    : isFocus
      ? '#0d0d12' // Greyscale/900
      : '#818898' // Greyscale/400

  return (
    <Dropdown
      style={[
        styles.dropdown,
        isFocus && !isDisabled && styles.dropdownFocused,
        isDisabled && styles.dropdownDisabled,
      ]}
      placeholderStyle={[
        styles.placeholderStyle,
        isDisabled && styles.placeholderDisabled,
      ]}
      selectedTextStyle={[
        styles.selectedTextStyle,
        isDisabled && styles.selectedTextDisabled,
      ]}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      iconColor={iconColor}
      data={options}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={handleChange}
      disable={isDisabled}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    height: 48, // Matches Figma
    backgroundColor: '#ffffff',
    borderColor: '#dfe1e7', // Greyscale/100
    borderWidth: 1,
    borderRadius: 10, // Matches Figma
    paddingHorizontal: 12, // Matches Figma px-12
    paddingVertical: 8, // Matches Figma py-8
  },
  dropdownFocused: {
    borderColor: '#656bfa', // Primary/300
    shadowColor: 'rgba(13, 13, 18, 0.05)', // Approximates Figma's two-drop-shadow
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 1,
    elevation: 3, // Android shadow
  },
  dropdownDisabled: {
    backgroundColor: '#f6f8fa', // Greyscale/25
    borderColor: '#dfe1e7', // Greyscale/100
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#818898', // Greyscale/400
  },
  placeholderDisabled: {
    color: '#a4acb9', // Greyscale/300
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#0d0d12', // Greyscale/900
  },
  selectedTextDisabled: {
    color: '#a4acb9', // Greyscale/300
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
})

export { Select }
