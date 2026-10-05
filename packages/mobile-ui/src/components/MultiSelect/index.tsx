'use client'

import { Check, X } from 'lucide-react-native'
import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import {
  IMultiSelectRef,
  MultiSelect as RNMultiSelect,
} from 'react-native-element-dropdown'

// Public API
export type MultiSelectOption = {
  label: string
  value: string
}

export type MultiSelectProps = {
  options: MultiSelectOption[]
  defaultValue?: string[]
  value?: string[]
  onChange?: (options: MultiSelectOption[]) => void
  isDisabled?: boolean
  className?: string
  placeholder?: string
}

const MultiSelect = React.forwardRef<IMultiSelectRef, MultiSelectProps>(
  function MultiSelect(
    {
      options,
      defaultValue,
      value: controlledValue,
      onChange,
      isDisabled = false,
      className,
      placeholder = 'Select options',
      ...props
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = React.useState<string[]>(
      defaultValue || [],
    )
    const [isFocused, setIsFocused] = React.useState(false)
    const multiSelectRef = React.useRef<IMultiSelectRef>(null)

    // Determine if controlled or uncontrolled
    const isControlled = controlledValue !== undefined
    const currentValue = isControlled ? controlledValue : internalValue

    // Calculate visible items (first 2) and remaining count
    const visibleItems = React.useMemo(
      () => currentValue.slice(0, 2),
      [currentValue],
    )
    const remainingCount = Math.max(0, currentValue.length - 2)
    const remainingItems = React.useMemo(
      () => currentValue.slice(2),
      [currentValue],
    )

    // Handle value change
    // react-native-element-dropdown's MultiSelect onChange receives an array of values (strings)
    // Since we only pass visibleItems (first 2) to the library, we need to merge changes
    // with remainingItems to maintain full selection state
    const handleChange = React.useCallback(
      (selectedValues: string[]) => {
        // The library passes an array of values (strings), not objects
        if (!Array.isArray(selectedValues)) {
          return
        }

        // Filter out any invalid values
        const validValues = selectedValues.filter(
          (value): value is string =>
            typeof value === 'string' && value.length > 0,
        )

        // The library's selectedValues represents the new state of visibleItems after user interaction
        // We need to determine what changed:
        // - Items removed from visibleItems: not in selectedValues but were in visibleItems
        // - Items added to visibleItems: in selectedValues but weren't in visibleItems
        // - Items in remainingItems that are now in selectedValues: were clicked, should be removed from full selection

        // Find items that were removed from visibleItems (user unselected them)
        const removedFromVisible = visibleItems.filter(
          (item) => !validValues.includes(item),
        )

        // Find items that were added to visibleItems (could be new selections or items from remainingItems)
        const addedToVisible = validValues.filter(
          (item) => !visibleItems.includes(item),
        )

        // For items added to visible, check if they were already in remainingItems
        // If so, they were clicked to be removed (not added)
        const itemsToRemove = addedToVisible.filter((item) =>
          remainingItems.includes(item),
        )

        // Items that are truly new (not in visibleItems or remainingItems)
        const itemsToAdd = addedToVisible.filter(
          (item) => !remainingItems.includes(item),
        )

        // Build new full value:
        // 1. Start with current full value
        // 2. Remove items that were unselected from visibleItems
        // 3. Remove items from remainingItems that were clicked (moved to visible to be removed)
        // 4. Add truly new items
        let newFullValue = currentValue.filter(
          (item) =>
            !removedFromVisible.includes(item) && !itemsToRemove.includes(item),
        )

        // Add new items
        newFullValue = [...newFullValue, ...itemsToAdd]

        // Remove duplicates (safety check)
        newFullValue = Array.from(new Set(newFullValue))

        // Map values back to full options
        const selectedOptions: MultiSelectOption[] = newFullValue
          .map((value) => {
            const option = options.find((opt) => opt.value === value)
            return option
          })
          .filter((option): option is MultiSelectOption => option !== undefined)

        if (!isControlled) {
          setInternalValue(newFullValue)
        }

        onChange?.(selectedOptions)
      },
      [
        onChange,
        isControlled,
        options,
        currentValue,
        visibleItems,
        remainingItems,
      ],
    )

    // Convert options to data format expected by react-native-element-dropdown
    const data = options.map((option) => ({
      label: option.label,
      value: option.value,
    }))

    // Render selected item (badge)
    const renderSelectedItem = (
      item: MultiSelectOption,
      unSelect?: (item: MultiSelectOption) => void,
    ) => {
      return (
        <TouchableOpacity
          onPress={() => unSelect && unSelect(item)}
          disabled={isDisabled}
          style={[styles.badge, isDisabled && styles.badgeDisabled]}>
          <Text
            style={[styles.badgeText, isDisabled && styles.badgeTextDisabled]}
            numberOfLines={1}>
            {item.label}
          </Text>
          <X
            size={12}
            color={isDisabled ? '#a4acb9' : '#818898'}
            style={styles.badgeIcon}
          />
        </TouchableOpacity>
      )
    }

    // Render dropdown item
    // The library wraps this in a pressable, so we just return the content
    type LibraryItem = { label: string; value: string }
    const renderItem = (item: LibraryItem) => {
      const isSelected = currentValue.includes(item.value)

      return (
        <View
          style={[
            styles.dropdownItem,
            isSelected && styles.dropdownItemSelected,
          ]}>
          <View style={styles.dropdownItemContent}>
            <Text style={styles.dropdownItemText}>{item.label}</Text>

            <Check size={16} color={isSelected ? '#3f46f9' : 'transparent'} />
          </View>
        </View>
      )
    }

    return (
      <View className={className} style={styles.wrapper}>
        <RNMultiSelect
          ref={ref || multiSelectRef}
          inside
          data={data}
          labelField="label"
          valueField="value"
          value={visibleItems}
          onChange={handleChange}
          placeholder={placeholder}
          disable={isDisabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.dropdown,
            isFocused && !isDisabled && styles.dropdownFocused,
            isDisabled && styles.dropdownDisabled,
          ]}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          inputSearchStyle={styles.inputSearch}
          iconStyle={styles.icon}
          containerStyle={styles.container}
          itemContainerStyle={styles.itemContainer}
          itemTextStyle={styles.itemText}
          selectedStyle={styles.selectedStyle}
          renderSelectedItem={renderSelectedItem}
          iconColor={isDisabled ? '#a4acb9' : '#818898'}
          renderItem={renderItem}
          {...props}
        />
        {remainingCount > 0 && (
          <TouchableWithoutFeedback
            onPress={() => multiSelectRef.current?.open()}
            disabled={isDisabled}>
            <View
              style={[
                styles.remainingBadge,
                isDisabled && styles.badgeDisabled,
              ]}>
              <Text
                style={[
                  styles.remainingBadgeText,
                  isDisabled && styles.badgeTextDisabled,
                ]}>
                +{remainingCount}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    )
  },
)

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  remainingBadge: {
    position: 'absolute',
    right: 40, // Match input padding
    top: '50%',
    marginTop: -12, // Half of badge height (24/2) to center vertically
    height: 24, // Same as regular badge
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe1e7',
    borderRadius: 4,
    paddingLeft: 8,
    paddingRight: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  remainingBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#818898', // Gray text color
    lineHeight: 14,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  dropdown: {
    height: 48, // Fixed height as per Figma
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfe1e7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dropdownFocused: {
    borderColor: '#656bfa',
    // ...shadowInputFocus,
  },
  dropdownDisabled: {
    backgroundColor: '#f6f8fa',
    borderColor: '#dfe1e7',
  },
  placeholder: {
    fontSize: 16,
    color: '#818898',
  },
  selectedText: {
    fontSize: 16,
    color: '#0d0d12',
  },
  inputSearch: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    width: 24,
    height: 24,
  },
  container: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfe1e7',
    backgroundColor: '#ffffff',
  },
  itemContainer: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    color: '#0d0d12',
  },
  selectedStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: 0,
    maxWidth: '100%',
    width: '100%',
    gap: 6, // Spacing between badges as per Figma
  },
  // Badge styles
  badge: {
    height: 24, // Fixed height as per Figma
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe1e7',
    borderRadius: 4,
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Gap between text and icon as per Figma
    marginRight: 6, // Spacing between badges as per Figma
    marginBottom: 0,
    marginTop: 0,
  },
  badgeDisabled: {
    backgroundColor: '#f6f8fa',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0d0d12',
    lineHeight: 14,
    textAlignVertical: 'center',
    includeFontPadding: false,
    maxWidth: 100, // Adjust to your needs
  },
  badgeTextDisabled: {
    color: '#a4acb9',
  },
  badgeIcon: {
    // Ensure icon is centered
  },
  // Dropdown item styles
  dropdownItem: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  dropdownItemSelected: {
    backgroundColor: '#f6f8fa',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dropdownItemText: {
    fontSize: 16,
    color: '#0d0d12',
    flex: 1,
  },
})

export { MultiSelect }
