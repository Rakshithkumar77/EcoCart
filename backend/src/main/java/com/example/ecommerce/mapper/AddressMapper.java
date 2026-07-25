package com.example.ecommerce.mapper;

import com.example.ecommerce.dto.AddressResponseDto;
import com.example.ecommerce.entity.Address;

public class AddressMapper {

    public static AddressResponseDto toResponseDto(Address address) {
        if (address == null) {
            return null;
        }

        return AddressResponseDto.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zip(address.getZip())
                .country(address.getCountry())
                .phone(address.getPhone())
                .isDefault(address.isDefault())
                .build();
    }
}
