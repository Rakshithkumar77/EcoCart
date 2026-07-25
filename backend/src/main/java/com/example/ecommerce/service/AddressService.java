package com.example.ecommerce.service;

import com.example.ecommerce.dto.AddressRequestDto;
import com.example.ecommerce.dto.AddressResponseDto;

import java.util.List;

public interface AddressService {
    List<AddressResponseDto> getAddressesByUserId(Long userId);
    AddressResponseDto getAddressById(Long userId, Long addressId);
    AddressResponseDto createAddress(Long userId, AddressRequestDto request);
    AddressResponseDto updateAddress(Long userId, Long addressId, AddressRequestDto request);
    void deleteAddress(Long userId, Long addressId);
}
